export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenFromRequest, unauthorized } from '@/lib/server-auth';

export async function PATCH(req: NextRequest) {
  const user = getTokenFromRequest(req);
  if (!user) return unauthorized();

  await supabaseAdmin
    .from('notifications')
    .update({ read_status: true })
    .eq('user_id', user.sub);

  return NextResponse.json({ message: 'All notifications marked as read' });
}
