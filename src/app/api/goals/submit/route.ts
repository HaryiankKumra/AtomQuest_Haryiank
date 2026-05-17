export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenFromRequest, unauthorized } from '@/lib/server-auth';
import { logAudit, createNotification } from '@/lib/server-utils';

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req);
  if (!user) return unauthorized();

  // Get all draft/revision_requested goals
  const { data: drafts } = await supabaseAdmin
    .from('goals').select('*')
    .eq('employee_id', user.sub)
    .in('status', ['draft', 'revision_requested']);

  if (!drafts || drafts.length === 0) {
    return NextResponse.json({ detail: 'No draft goals to submit.' }, { status: 400 });
  }

  // Compute total weightage across all active goals
  const { data: all } = await supabaseAdmin
    .from('goals').select('weightage')
    .eq('employee_id', user.sub)
    .neq('status', 'rejected');

  const total = (all || []).reduce((s: number, g: any) => s + g.weightage, 0);
  if (Math.abs(total - 100) > 0.5) {
    return NextResponse.json({
      detail: `Total weightage is ${total.toFixed(1)}%. Must equal exactly 100% before submission.`
    }, { status: 422 });
  }

  // Update status to pending_approval
  const ids = drafts.map((g: any) => g.id);
  await supabaseAdmin
    .from('goals')
    .update({ status: 'pending_approval', updated_at: new Date().toISOString() })
    .in('id', ids);

  for (const g of drafts) {
    await logAudit(supabaseAdmin, user.sub, 'goal', g.id, 'submitted', null, { status: 'pending_approval' });
  }

  // Notify manager
  const { data: emp } = await supabaseAdmin.from('users').select('manager_id, name').eq('id', user.sub).single();
  if (emp?.manager_id) {
    await createNotification(supabaseAdmin, emp.manager_id, 'New Goals Pending Approval',
      `${emp.name} has submitted ${drafts.length} goal(s) for your approval.`);
  }

  return NextResponse.json({ message: `${drafts.length} goal(s) submitted for approval.` });
}
