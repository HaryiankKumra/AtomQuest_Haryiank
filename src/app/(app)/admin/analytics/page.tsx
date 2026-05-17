'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { analyticsApi, adminApi } from '@/lib/api/analytics';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { BarChart3, Download, Users } from 'lucide-react';
import type { AnalyticsDashboard } from '@/types';

const AdminBarChart = dynamic(
  () => import('@/components/analytics/DashboardCharts').then(m => ({ default: m.AdminBarChart })),
  { ssr: false, loading: () => <div className="h-56 rounded animate-pulse" style={{ background: 'var(--surface-2)' }} /> }
);
const AdminPieChart = dynamic(
  () => import('@/components/analytics/DashboardCharts').then(m => ({ default: m.AdminPieChart })),
  { ssr: false, loading: () => <div className="h-56 rounded animate-pulse" style={{ background: 'var(--surface-2)' }} /> }
);
const QoQBarChart = dynamic(
  () => import('@/components/analytics/DashboardCharts').then(m => ({ default: m.QoQBarChart })),
  { ssr: false, loading: () => <div className="h-52 rounded animate-pulse" style={{ background: 'var(--surface-2)' }} /> }
);

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.overview(), adminApi.users()])
      .then(([a, u]) => { setData(a); setUsers(u); })
      .finally(() => setLoading(false));
  }, []);

  const ov = data?.overview;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Analytics Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Enterprise-wide goal performance insights
          </p>
        </div>
        <a href={adminApi.exportCSV()} download className="btn-secondary text-xs">
          <Download size={13} /> Export CSV
        </a>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl" style={{ background: 'var(--surface-2)' }} />)}
          </div>
          <div className="h-64 rounded-xl" style={{ background: 'var(--surface-2)' }} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Goals" value={ov?.total_goals ?? 0} icon={<BarChart3 size={18} />} />
            <KPICard title="Approved" value={ov?.approved_goals ?? 0} accentColor="#10b981" icon={<BarChart3 size={18} />} />
            <KPICard title="Pending Approval" value={ov?.pending_approvals ?? 0} accentColor="#f59e0b" icon={<BarChart3 size={18} />} />
            <KPICard title="Avg. Progress" value={`${ov?.avg_progress_score ?? 0}%`} accentColor="#3b82f6" icon={<BarChart3 size={18} />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Goal Distribution by Department</h2>
              <AdminBarChart data={data?.by_department ?? []} />
            </div>
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Completion Rate Heatmap</h2>
              <AdminPieChart data={data?.by_department ?? []} />
            </div>
          </div>

          {data?.qoq_trends && data.qoq_trends.length > 0 && (
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quarter-on-Quarter Progress</h2>
              <QoQBarChart data={data.qoq_trends} />
            </div>
          )}

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} style={{ color: 'var(--text-muted)' }} />
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                All Users ({users.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="font-medium text-sm">{u.name}</td>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td><StatusBadge value={u.role} type="role" /></td>
                      <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{u.department || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
