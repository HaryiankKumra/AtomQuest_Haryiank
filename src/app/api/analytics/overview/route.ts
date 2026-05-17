export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenFromRequest, unauthorized } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getTokenFromRequest(req);
  if (!user) return unauthorized();

  let goalsQuery = supabaseAdmin.from('goals').select('id, status, weightage, employee_id');
  let checkinsQuery = supabaseAdmin.from('quarterly_checkins').select('progress_score, goal_id');

  if (user.role === 'employee') {
    goalsQuery = goalsQuery.eq('employee_id', user.sub);
    const { data: gIds } = await supabaseAdmin.from('goals').select('id').eq('employee_id', user.sub);
    if (gIds?.length) checkinsQuery = checkinsQuery.in('goal_id', gIds.map((g: any) => g.id));
  } else if (user.role === 'manager') {
    const { data: team } = await supabaseAdmin.from('users').select('id').eq('manager_id', user.sub);
    const ids = (team || []).map((m: any) => m.id);
    if (ids.length) {
      goalsQuery = goalsQuery.in('employee_id', ids);
      const { data: gIds } = await supabaseAdmin.from('goals').select('id').in('employee_id', ids);
      if (gIds?.length) checkinsQuery = checkinsQuery.in('goal_id', gIds.map((g: any) => g.id));
    }
  }

  const [{ data: goals }, { data: checkins }] = await Promise.all([goalsQuery, checkinsQuery]);

  const total_goals = goals?.length || 0;
  const approved_goals = goals?.filter((g: any) => g.status === 'approved').length || 0;
  const pending_approvals = goals?.filter((g: any) => g.status === 'pending_approval').length || 0;
  const scores = (checkins || []).map((c: any) => c.progress_score).filter(Boolean);
  const avg_progress_score = scores.length ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;

  const overview = { total_goals, approved_goals, pending_approvals, avg_progress_score };

  // Department breakdown (admin only)
  let by_department: any[] = [];
  if (user.role === 'admin') {
    const { data: allGoals } = await supabaseAdmin.from('goals').select('status, employee_id, weightage');
    const { data: allUsers } = await supabaseAdmin.from('users').select('id, department').eq('role', 'employee');
    const deptMap = new Map(allUsers?.map((u: any) => [u.id, u.department]));
    const depts = Array.from(new Set(allUsers?.map((u: any) => u.department)));

    by_department = depts.map((dept: any) => {
      const empIds = allUsers?.filter((u: any) => u.department === dept).map((u: any) => u.id) || [];
      const deptGoals = allGoals?.filter((g: any) => empIds.includes(g.employee_id)) || [];
      const total = deptGoals.length;
      const approved = deptGoals.filter((g: any) => g.status === 'approved').length;
      const completion_rate = total ? Math.round((approved / total) * 100) : 0;
      return { department: dept, total_goals: total, approved, completion_rate };
    });
  }

  // QoQ trends
  const { data: qCheckins } = await supabaseAdmin.from('quarterly_checkins').select('quarter, year, progress_score, status');
  const qMap: Record<string, number[]> = {};
  for (const c of qCheckins || []) {
    const key = `Q${c.quarter} ${c.year}`;
    qMap[key] = qMap[key] || [];
    if (c.progress_score) qMap[key].push(c.progress_score);
  }
  const qoq_trends = Object.entries(qMap).map(([quarter, scores]) => ({
    quarter,
    avg_score: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    completed: scores.filter(s => s >= 100).length,
  })).sort((a, b) => a.quarter.localeCompare(b.quarter));

  return NextResponse.json({ overview, by_department, qoq_trends });
}
