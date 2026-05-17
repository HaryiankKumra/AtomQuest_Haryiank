import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenFromRequest, unauthorized } from '@/lib/server-auth';
import { computeProgressScore, logAudit } from '@/lib/server-utils';

export async function GET(req: NextRequest, { params }: { params: { goalId: string } }) {
  const user = getTokenFromRequest(req);
  if (!user) return unauthorized();

  const { data, error } = await supabaseAdmin
    .from('quarterly_checkins').select('*')
    .eq('goal_id', params.goalId)
    .order('year').order('quarter');

  if (error) return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
