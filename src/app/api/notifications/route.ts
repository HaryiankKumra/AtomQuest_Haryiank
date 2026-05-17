export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenFromRequest, unauthorized } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getTokenFromRequest(req);
  if (!user) return unauthorized();

  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', user.sub)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
