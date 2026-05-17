'use client';

import { useEffect, useState } from 'react';
import { analyticsApi, adminApi } from '@/lib/api/analytics';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Shield, Users, Target, Clock, Lock, FileText } from 'lucide-react';
import Link from 'next/link';
import type { AnalyticsDashboard } from '@/types';

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [locked, setLocked] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.overview(), adminApi.users(), adminApi.lockedGoals()])
      .then(([a, u, l]) => { setData(a); setUsers(u); setLocked(l); })
      .finally(() => setLoading(false));
  }, []);

  const ov = data?.overview;
  const roleBreakdown = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
          <Shield size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Control Panel</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>System-wide oversight and management</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl" style={{ background: 'var(--surface-2)' }} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Users" value={users.length} icon={<Users size={18} />} />
            <KPICard title="Total Goals" value={ov?.total_goals ?? 0} icon={<Target size={18} />} />
            <KPICard title="Pending Approvals" value={ov?.pending_approvals ?? 0} accentColor="#f59e0b" icon={<Clock size={18} />} />
            <KPICard title="Locked Goals" value={locked.length} accentColor="#f59e0b" icon={<Lock size={18} />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick actions */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { href: '/admin/unlock', icon: <Lock size={14} />, label: 'Manage Unlock Requests', count: locked.length },
                  { href: '/admin/audit', icon: <FileText size={14} />, label: 'View Audit Logs', count: null },
                  { href: '/admin/analytics', icon: <Shield size={14} />, label: 'Analytics Dashboard', count: null },
                  { href: '/manager/approvals', icon: <Clock size={14} />, label: 'Approvals Queue', count: ov?.pending_approvals },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors"
                    style={{ background: 'var(--surface-2)' }}
                  >
                    <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {item.icon}
                      {item.label}
                    </div>
                    {item.count !== null && item.count !== undefined && item.count > 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                        {item.count}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Role distribution */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>User Role Distribution</h2>
              <div className="space-y-3">
                {Object.entries(roleBreakdown).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <StatusBadge value={role} type="role" />
                    <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Department stats */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Department Completion</h2>
              <div className="space-y-3">
                {data?.by_department.map((dept) => (
                  <div key={dept.department}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{dept.department}</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {dept.completion_rate}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${dept.completion_rate}%`,
                          background: dept.completion_rate >= 75 ? '#10b981' : dept.completion_rate >= 50 ? '#6366f1' : '#f59e0b'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
