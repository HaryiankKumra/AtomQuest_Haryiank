export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenFromRequest, unauthorized, requireRole, notFound, forbidden } from '@/lib/server-auth';
import { logAudit, createNotification } from '@/lib/server-utils';

export async function POST(req: NextRequest, { params }: { params: { goalId: string } }) {
  const user = getTokenFromRequest(req);
  const denied = requireRole(user, 'manager', 'admin');
  if (denied) return denied;

  const { data: goal } = await supabaseAdmin.from('goals').select('*').eq('id', params.goalId).single();
  if (!goal) return notFound('Goal not found');
  if (goal.status !== 'pending_approval') {
    return NextResponse.json({ detail: 'Goal is not in pending_approval state.' }, { status: 400 });
  }

  const { approval_status, comment, edited_target, edited_weightage } = await req.json();

  if (!['approved', 'rejected', 'revision_requested'].includes(approval_status)) {
    return NextResponse.json({ detail: 'Invalid approval status.' }, { status: 400 });
  }

  // Build goal update
  const goalUpdate: any = { status: approval_status, updated_at: new Date().toISOString() };
  if (approval_status === 'approved') {
    goalUpdate.is_locked = true;
    if (edited_target) goalUpdate.target = edited_target;
    if (edited_weightage) goalUpdate.weightage = edited_weightage;
  }

  await supabaseAdmin.from('goals').update(goalUpdate).eq('id', params.goalId);

  // Record approval
  await supabaseAdmin.from('goal_approvals').insert({
    goal_id: params.goalId,
    manager_id: user!.sub,
    approval_status,
    comment,
    edited_target: edited_target || null,
    edited_weightage: edited_weightage || null,
  });

  await logAudit(supabaseAdmin, user!.sub, 'goal', params.goalId, `approval_${approval_status}`,
    { status: 'pending_approval' }, goalUpdate);

  // Notify employee
  const messages: Record<string, string> = {
    approved: `Your goal "${goal.title}" has been approved and locked.`,
    rejected: `Your goal "${goal.title}" was rejected. ${comment || ''}`,
    revision_requested: `Manager requested changes to "${goal.title}". ${comment || ''}`,
  };
  await createNotification(supabaseAdmin, goal.employee_id,
    approval_status === 'approved' ? 'Goal Approved ✅' :
    approval_status === 'rejected' ? 'Goal Rejected' : 'Revision Requested',
    messages[approval_status]);

  return NextResponse.json({ message: `Goal ${approval_status}`, goal_id: params.goalId });
}
