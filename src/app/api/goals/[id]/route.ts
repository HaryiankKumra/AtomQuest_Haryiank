export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenFromRequest, unauthorized, notFound, forbidden } from '@/lib/server-auth';
import { logAudit } from '@/lib/server-utils';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req);
  if (!user) return unauthorized();

  const { data: goal } = await supabaseAdmin.from('goals').select('*').eq('id', params.id).single();
  if (!goal) return notFound();
  if (goal.employee_id !== user.sub && user.role !== 'admin') return forbidden();
  if (goal.is_locked) return forbidden('Goal is locked. Contact admin to unlock.');
  if (goal.status === 'approved') return forbidden('Approved goals cannot be edited.');

  const body = await req.json();
  const old = { weightage: goal.weightage, target: goal.target, title: goal.title };

  // Shared goals: title and target are read-only
  if (goal.is_shared) { delete body.title; delete body.target; }

  // Re-validate weightage if changing
  if (body.weightage !== undefined) {
    if (body.weightage < 10) return NextResponse.json({ detail: 'Min weightage is 10%' }, { status: 422 });
    const { data: others } = await supabaseAdmin
      .from('goals').select('weightage').eq('employee_id', goal.employee_id)
      .neq('id', params.id).neq('status', 'rejected');
    const total = (others || []).reduce((s: number, g: any) => s + g.weightage, 0) + body.weightage;
    if (total > 100.01) return NextResponse.json({ detail: `Total would be ${total.toFixed(1)}%. Max is 100%.` }, { status: 422 });
  }

  const updates = { ...body, updated_at: new Date().toISOString() };
  const { data, error } = await supabaseAdmin.from('goals').update(updates).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ detail: error.message }, { status: 500 });

  await logAudit(supabaseAdmin, user.sub, 'goal', params.id, 'updated', old, updates);
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req);
  if (!user) return unauthorized();

  const { data: goal } = await supabaseAdmin.from('goals').select('*').eq('id', params.id).single();
  if (!goal) return notFound();
  if (goal.employee_id !== user.sub && user.role !== 'admin') return forbidden();
  if (goal.is_locked) return forbidden('Goal is locked.');
  if (!['draft', 'rejected', 'revision_requested'].includes(goal.status)) {
    return NextResponse.json({ detail: 'Only draft/rejected goals can be deleted.' }, { status: 400 });
  }

  await logAudit(supabaseAdmin, user.sub, 'goal', params.id, 'deleted', { title: goal.title }, null);
  await supabaseAdmin.from('goals').delete().eq('id', params.id);
  return new NextResponse(null, { status: 204 });
}
