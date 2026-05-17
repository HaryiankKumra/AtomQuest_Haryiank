import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenFromRequest, unauthorized, requireRole } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getTokenFromRequest(req);
  const denied = requireRole(user, 'manager', 'admin');
  if (denied) return denied;

  // Get team member ids
  const { data: team } = await supabaseAdmin
    .from('users').select('id, name, department')
    .eq('manager_id', user!.sub);
  const ids = (team || []).map((m: any) => m.id);
  if (ids.length === 0) return NextResponse.json([]);

  const { data: goals } = await supabaseAdmin
    .from('goals').select('*')
    .in('employee_id', ids)
    .eq('status', 'pending_approval')
    .order('updated_at', { ascending: true });

  const enriched = (goals || []).map((g: any) => {
    const emp = team!.find((t: any) => t.id === g.employee_id);
    return { ...g, employee_name: emp?.name, department: emp?.department };
  });

  return NextResponse.json(enriched);
}
