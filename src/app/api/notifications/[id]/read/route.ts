import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenFromRequest, unauthorized } from '@/lib/server-auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getTokenFromRequest(req);
  if (!user) return unauthorized();

  await supabaseAdmin
    .from('notifications')
    .update({ read_status: true })
    .eq('id', params.id)
    .eq('user_id', user.sub);

  return NextResponse.json({ message: 'Marked as read' });
}
