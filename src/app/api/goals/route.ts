export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenFromRequest, unauthorized, forbidden, unprocessable } from '@/lib/server-auth';
import { logAudit, createNotification } from '@/lib/server-utils';

const MAX_GOALS = 8;
const MIN_WEIGHT = 10;

export async function GET(req: NextRequest) {
  const user = getTokenFromRequest(req);
  if (!user) return unauthorized();

  let query = supabaseAdmin.from('goals').select('*');

  if (user.role === 'employee') {
    query = query.eq('employee_id', user.sub);
  } else if (user.role === 'manager') {
    const { data: teamMembers } = await supabaseAdmin
      .from('users').select('id').eq('manager_id', user.sub);
    const ids = (teamMembers || []).map((m: any) => m.id);
    if (ids.length > 0) query = query.in('employee_id', ids);
    else return NextResponse.json([]);
  }
  // admin sees all

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req);
  if (!user) return unauthorized();

  const body = await req.json();
  const { thrust_area, title, description, uom_type, target, weightage, shared_goal_group_id } = body;

  // Validate min weightage
  if (weightage < MIN_WEIGHT) return unprocessable(`Minimum weightage is ${MIN_WEIGHT}%`);
  if (weightage > 100) return unprocessable('Weightage cannot exceed 100%');
  if (target <= 0) return unprocessable('Target must be a positive number');

  // Check max goals constraint
  const { count } = await supabaseAdmin
    .from('goals')
    .select('*', { count: 'exact', head: true })
    .eq('employee_id', user.sub)
    .neq('status', 'rejected');

  if ((count || 0) >= MAX_GOALS) {
    return unprocessable(`Maximum ${MAX_GOALS} goals allowed per employee`);
  }

  // Check total weightage constraint
  const { data: existing } = await supabaseAdmin
    .from('goals').select('weightage')
    .eq('employee_id', user.sub)
    .neq('status', 'rejected');
  
  const total = (existing || []).reduce((s: number, g: any) => s + g.weightage, 0) + weightage;
  if (total > 100.01) {
    return unprocessable(`Total weightage would be ${total.toFixed(1)}%. Must not exceed 100%.`);
  }

  const { data, error } = await supabaseAdmin.from('goals').insert({
    employee_id: user.sub, thrust_area, title, description,
    uom_type: uom_type || 'min', target, weightage,
    status: 'draft', is_locked: false,
    is_shared: !!shared_goal_group_id, shared_goal_group_id: shared_goal_group_id || null,
  }).select().single();

  if (error) return NextResponse.json({ detail: error.message }, { status: 500 });

  await logAudit(supabaseAdmin, user.sub, 'goal', data.id, 'created', null, body);

  return NextResponse.json(data, { status: 201 });
}
