import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenFromRequest, unauthorized, requireRole } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getTokenFromRequest(req);
  const denied = requireRole(user, 'manager', 'admin');
  if (denied) return denied;

  // Get team members
  const { data: team } = await supabaseAdmin
    .from('users').select('id, name, email, department')
    .eq('manager_id', user!.sub);

  if (!team || team.length === 0) return NextResponse.json([]);

  const ids = team.map((m: any) => m.id);
  const { data: goals } = await supabaseAdmin
    .from('goals').select('*').in('employee_id', ids)
    .order('created_at', { ascending: false });

  // Enrich with employee info
  const enriched = (goals || []).map((g: any) => {
    const emp = team.find((t: any) => t.id === g.employee_id);
    return { ...g, employee_name: emp?.name, employee_email: emp?.email, department: emp?.department };
  });

  return NextResponse.json(enriched);
}
