export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenFromRequest, requireRole } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getTokenFromRequest(req);
  const denied = requireRole(user, 'admin');
  if (denied) return denied;

  const url = new URL(req.url);
  const entity_type = url.searchParams.get('entity_type') || undefined;
  const skip = parseInt(url.searchParams.get('skip') || '0');
  const limit = parseInt(url.searchParams.get('limit') || '20');

  let query = supabaseAdmin.from('audit_logs').select('*', { count: 'exact' });
  if (entity_type) query = query.eq('entity_type', entity_type);

  const { data, count, error } = await query
    .order('timestamp', { ascending: false })
    .range(skip, skip + limit - 1);

  if (error) return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json({ data: data || [], total: count || 0, skip, limit });
}
