export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenFromRequest, unauthorized, notFound } from '@/lib/server-auth';
import { computeProgressScore, logAudit } from '@/lib/server-utils';

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req);
  if (!user) return unauthorized();

  const body = await req.json();
  const { goal_id, quarter, year, planned_target, actual_achievement, status, employee_comment } = body;

  if (!goal_id || !quarter || !year) {
    return NextResponse.json({ detail: 'goal_id, quarter, year are required' }, { status: 400 });
  }

  // Verify goal belongs to user and is approved
  const { data: goal } = await supabaseAdmin.from('goals').select('*').eq('id', goal_id).single();
  if (!goal) return notFound('Goal not found');
  if (goal.employee_id !== user.sub && user.role === 'employee') {
    return NextResponse.json({ detail: 'Forbidden' }, { status: 403 });
  }

  const progress_score = computeProgressScore(goal.uom_type, goal.target, actual_achievement);

  const upsertData = {
    goal_id, quarter, year,
    planned_target: planned_target ?? null,
    actual_achievement: actual_achievement ?? null,
    progress_score,
    status: status || 'on_track',
    employee_comment: employee_comment || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('quarterly_checkins')
    .upsert(upsertData, { onConflict: 'goal_id,quarter,year' })
    .select().single();

  if (error) return NextResponse.json({ detail: error.message }, { status: 500 });

  await logAudit(supabaseAdmin, user.sub, 'checkin', data.id, 'upserted', null, upsertData);
  return NextResponse.json(data, { status: 201 });
}
