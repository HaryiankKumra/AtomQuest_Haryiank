export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenFromRequest, requireRole } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getTokenFromRequest(req);
  const denied = requireRole(user, 'admin');
  if (denied) return denied;

  const { data, error } = await supabaseAdmin
    .from('goals').select('*')
    .eq('is_locked', true)
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
