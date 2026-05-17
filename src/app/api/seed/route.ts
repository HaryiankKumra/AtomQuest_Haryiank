import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';

const SEED_USERS = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Sarah Mitchell', email: 'admin@gstp.dev', password: 'Admin@123', role: 'admin', department: 'HR', manager_id: null },
  { id: '00000000-0000-0000-0000-000000000002', name: 'James Carter', email: 'manager1@gstp.dev', password: 'Manager@123', role: 'manager', department: 'Engineering', manager_id: null },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Priya Sharma', email: 'manager2@gstp.dev', password: 'Manager@123', role: 'manager', department: 'Sales', manager_id: null },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Alex Johnson', email: 'emp1@gstp.dev', password: 'Emp@123', role: 'employee', department: 'Engineering', manager_id: '00000000-0000-0000-0000-000000000002' },
  { id: '00000000-0000-0000-0000-000000000005', name: 'Riya Patel', email: 'emp2@gstp.dev', password: 'Emp@123', role: 'employee', department: 'Engineering', manager_id: '00000000-0000-0000-0000-000000000002' },
  { id: '00000000-0000-0000-0000-000000000006', name: 'Daniel Kim', email: 'emp3@gstp.dev', password: 'Emp@123', role: 'employee', department: 'Sales', manager_id: '00000000-0000-0000-0000-000000000003' },
];

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const force = url.searchParams.get('force') === 'true';

  if (!force) {
    const { count } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true });
    if (count && count > 0) {
      return NextResponse.json({ message: 'Already seeded. Use ?force=true to reseed.', users: count });
    }
  }

  // Clear all data first (in dependency order)
  await supabaseAdmin.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('quarterly_checkins').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('goal_approvals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('goals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Hash and insert users
  for (const u of SEED_USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    const { error } = await supabaseAdmin.from('users').insert({
      id: u.id, name: u.name, email: u.email, password_hash: hash,
      role: u.role, department: u.department, manager_id: u.manager_id,
    });
    if (error) console.error('User insert error:', u.email, error.message);
  }

  // Goals for Alex (emp1) - total weightage = 100%
  const emp1Id = '00000000-0000-0000-0000-000000000004';
  const goalIds = {
    g1: '10000000-0000-0000-0000-000000000001',
    g2: '10000000-0000-0000-0000-000000000002',
    g3: '10000000-0000-0000-0000-000000000003',
    g4: '10000000-0000-0000-0000-000000000004',
    g5: '10000000-0000-0000-0000-000000000005',
    g6: '10000000-0000-0000-0000-000000000006',
    g7: '10000000-0000-0000-0000-000000000007',
    g8: '10000000-0000-0000-0000-000000000008',
  };

  const { error: goalErr } = await supabaseAdmin.from('goals').insert([
    { id: goalIds.g1, employee_id: emp1Id, thrust_area: 'Technical Excellence', title: 'Reduce API P95 Latency to <200ms', description: 'Optimize all critical API paths. Benchmark weekly.', uom_type: 'max', target: 200, weightage: 25, status: 'approved', is_locked: true },
    { id: goalIds.g2, employee_id: emp1Id, thrust_area: 'Technical Excellence', title: 'Achieve 85% Unit Test Coverage', description: 'All modules must have >= 85% test coverage.', uom_type: 'min', target: 85, weightage: 20, status: 'approved', is_locked: true },
    { id: goalIds.g3, employee_id: emp1Id, thrust_area: 'Leadership & People', title: 'Mentor 2 Junior Engineers', description: 'Bi-weekly 1:1s and structured code reviews for 2 juniors.', uom_type: 'min', target: 2, weightage: 20, status: 'approved', is_locked: true },
    { id: goalIds.g4, employee_id: emp1Id, thrust_area: 'Delivery', title: 'Zero Critical Bugs in Production', description: 'No P0/P1 bugs attributable to team code in production.', uom_type: 'zero_based', target: 0, weightage: 20, status: 'approved', is_locked: true },
    { id: goalIds.g5, employee_id: emp1Id, thrust_area: 'Innovation', title: 'Ship 3 New Product Features', description: 'End-to-end delivery with full QA sign-off. Target: Q2.', uom_type: 'min', target: 3, weightage: 15, status: 'draft', is_locked: false },
  ]);
  if (goalErr) console.error('Alex goals error:', goalErr.message);

  // Goals for Riya (emp2) — pending approval, total = 100%
  const emp2Id = '00000000-0000-0000-0000-000000000005';
  await supabaseAdmin.from('goals').insert([
    { id: goalIds.g6, employee_id: emp2Id, thrust_area: 'Delivery', title: 'Maintain CI/CD Pipeline 99.5% Uptime', description: 'Monitor and improve build/deploy pipeline reliability.', uom_type: 'min', target: 99.5, weightage: 30, status: 'pending_approval', is_locked: false },
    { id: goalIds.g7, employee_id: emp2Id, thrust_area: 'Technical Excellence', title: 'Containerize 5 Legacy Services', description: 'Migrate legacy NodeJS services to Docker with health checks.', uom_type: 'min', target: 5, weightage: 40, status: 'pending_approval', is_locked: false },
    { id: goalIds.g8, employee_id: emp2Id, thrust_area: 'Learning & Growth', title: 'Earn AWS Solutions Architect Cert', description: 'Pass AWS SAA-C03 by end of Q3 2026.', uom_type: 'min', target: 1, weightage: 30, status: 'pending_approval', is_locked: false },
  ]);

  // Goals for Daniel (emp3) — draft
  const emp3Id = '00000000-0000-0000-0000-000000000006';
  await supabaseAdmin.from('goals').insert([
    { id: '20000000-0000-0000-0000-000000000001', employee_id: emp3Id, thrust_area: 'Revenue', title: 'Close $500K in New ARR', description: 'Net new ARR from enterprise accounts.', uom_type: 'min', target: 500000, weightage: 40, status: 'draft', is_locked: false },
    { id: '20000000-0000-0000-0000-000000000002', employee_id: emp3Id, thrust_area: 'Customer Success', title: 'Maintain NPS Score > 70', description: 'Track quarterly NPS; ensure > 70 across assigned accounts.', uom_type: 'min', target: 70, weightage: 35, status: 'draft', is_locked: false },
    { id: '20000000-0000-0000-0000-000000000003', employee_id: emp3Id, thrust_area: 'Learning & Growth', title: 'Complete Salesforce Admin Certification', description: 'Pass SF Admin 201 exam by Q3.', uom_type: 'min', target: 1, weightage: 25, status: 'draft', is_locked: false },
  ]);

  // Approvals for Alex's goals (manager1 approved all 4)
  for (const gid of [goalIds.g1, goalIds.g2, goalIds.g3, goalIds.g4]) {
    await supabaseAdmin.from('goal_approvals').insert({
      goal_id: gid, manager_id: '00000000-0000-0000-0000-000000000002',
      approval_status: 'approved',
      comment: 'Well-aligned with Q2 team OKRs. Goals are specific and measurable. Approved.',
    });
  }
  // Pending approvals for Riya's goals
  for (const gid of [goalIds.g6, goalIds.g7, goalIds.g8]) {
    await supabaseAdmin.from('goal_approvals').insert({
      goal_id: gid, manager_id: '00000000-0000-0000-0000-000000000002',
      approval_status: 'pending',
    });
  }

  // Q1 + Q2 2026 check-ins for Alex's approved goals
  await supabaseAdmin.from('quarterly_checkins').insert([
    { goal_id: goalIds.g1, quarter: 1, year: 2026, planned_target: 220, actual_achievement: 210, progress_score: 95.2, status: 'on_track', employee_comment: 'P95 reduced from 280ms to 210ms. Caching implemented.', manager_comment: 'Great progress. Keep the momentum.' },
    { goal_id: goalIds.g2, quarter: 1, year: 2026, planned_target: 70, actual_achievement: 78, progress_score: 91.8, status: 'on_track', employee_comment: 'Coverage at 78%. Auth module fully tested.' },
    { goal_id: goalIds.g3, quarter: 1, year: 2026, planned_target: 1, actual_achievement: 1, progress_score: 100, status: 'completed', employee_comment: 'First mentor (Riya) assigned. Weekly sessions running.' },
    { goal_id: goalIds.g4, quarter: 1, year: 2026, planned_target: 0, actual_achievement: 0, progress_score: 100, status: 'completed', employee_comment: 'No P0/P1 bugs in Q1. Solid code review process in place.' },
    { goal_id: goalIds.g1, quarter: 2, year: 2026, planned_target: 205, actual_achievement: 195, progress_score: 97.4, status: 'on_track', employee_comment: 'Database query optimization complete. Sub-200ms on 90% of endpoints.' },
    { goal_id: goalIds.g2, quarter: 2, year: 2026, planned_target: 83, actual_achievement: 82, progress_score: 96.5, status: 'on_track', employee_comment: 'Coverage at 82%. Almost at target.' },
  ]);

  // Notifications
  await supabaseAdmin.from('notifications').insert([
    { user_id: '00000000-0000-0000-0000-000000000002', title: '⏳ New Goals Pending Review', body: 'Riya Patel submitted 3 goals for your approval. Please review within 48 hours.', read_status: false },
    { user_id: emp1Id, title: '✅ Goals Approved', body: 'James Carter approved all 4 of your submitted goals. They are now locked and active.', read_status: true },
    { user_id: emp1Id, title: '📊 Q2 Check-in Reminder', body: 'Q2 2026 check-in window is now open. Please update your achievement progress.', read_status: false },
    { user_id: emp2Id, title: '📤 Goals Submitted Successfully', body: 'Your 3 goals are pending manager review. You\'ll be notified once reviewed.', read_status: true },
    { user_id: '00000000-0000-0000-0000-000000000001', title: '🔔 System Ready', body: 'GSTP portal is live. All users have been onboarded and are ready to set goals.', read_status: false },
  ]);

  return NextResponse.json({
    message: '✅ Seed data loaded successfully',
    users: SEED_USERS.length,
    note: 'Login: admin@gstp.dev / Admin@123 | manager1@gstp.dev / Manager@123 | emp1@gstp.dev / Emp@123',
  });
}
