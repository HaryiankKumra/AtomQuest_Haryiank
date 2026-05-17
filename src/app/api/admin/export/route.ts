export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenFromRequest, requireRole } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getTokenFromRequest(req);
  const denied = requireRole(user, 'admin', 'manager');
  if (denied) return denied;

  let query = supabaseAdmin.from('goals').select(`
    id, employee_id, thrust_area, title, uom_type, target, weightage, status, created_at,
    users!inner(name, email, department)
  `);

  if (user!.role === 'manager') {
    const { data: team } = await supabaseAdmin.from('users').select('id').eq('manager_id', user!.sub);
    const ids = (team || []).map((m: any) => m.id);
    if (!ids.length) return new NextResponse('No goals', { status: 404 });
    query = query.in('employee_id', ids);
  }

  const { data } = await query;

  // Format as CSV
  const rows = (data || []).map((g: any) => [
    g.id, g.users?.name, g.users?.email, g.users?.department,
    g.thrust_area, g.title, g.uom_type, g.target, g.weightage, g.status, g.created_at
  ].map(v => `"${v ?? ''}"`).join(','));

  const csv = [
    'ID,Employee,Email,Department,Thrust Area,Title,UOM Type,Target,Weightage,Status,Created At',
    ...rows
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="goals_export.csv"',
    },
  });
}
