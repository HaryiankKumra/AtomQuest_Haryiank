import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenFromRequest, requireRole, notFound } from '@/lib/server-auth';
import { logAudit } from '@/lib/server-utils';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req);
  const denied = requireRole(user, 'admin');
  if (denied) return denied;

  const { data: goal } = await supabaseAdmin.from('goals').select('*').eq('id', params.id).single();
  if (!goal) return notFound();

  await supabaseAdmin.from('goals').update({
    is_locked: false,
    status: 'approved',
    updated_at: new Date().toISOString(),
  }).eq('id', params.id);

  await logAudit(supabaseAdmin, user!.sub, 'goal', params.id, 'unlocked',
    { is_locked: true }, { is_locked: false });

  return NextResponse.json({ message: 'Goal unlocked successfully' });
}
