'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Target, Clock, TrendingUp, Award } from 'lucide-react';
import { KPICard, ProgressBar } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAuthStore } from '@/lib/store/auth';
import { analyticsApi } from '@/lib/api/analytics';
import { goalsApi } from '@/lib/api/goals';
import { notificationsApi } from '@/lib/api/notifications';
import type { AnalyticsDashboard, Goal, Notification } from '@/types';
import { formatDateTime, truncate } from '@/lib/utils';

// Dynamic import with SSR disabled for recharts
const Charts = dynamic(() => import('@/components/analytics/DashboardCharts'), { ssr: false, loading: () => <div className="h-48 rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} /> });

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.overview(),
      goalsApi.list(),
      notificationsApi.list(),
    ]).then(([a, g, n]) => {
      setAnalytics(a);
      setGoals(g);
      setNotifications(n.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const ov = analytics?.overview;
  const currentYear = new Date().getFullYear();
  const currentQ = Math.ceil((new Date().getMonth() + 1) / 3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Q{currentQ} {currentYear} Performance Overview · {user?.department || 'Enterprise'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Goals"
          value={ov?.total_goals ?? 0}
          subtitle="This performance cycle"
          icon={<Target size={18} />}
          accentColor="#6366f1"
        />
        <KPICard
          title="Approved"
          value={ov?.approved_goals ?? 0}
          subtitle="Locked & active"
          icon={<Award size={18} />}
          accentColor="#10b981"
        />
        <KPICard
          title="Pending Approval"
          value={ov?.pending_approvals ?? 0}
          subtitle="Awaiting manager review"
          icon={<Clock size={18} />}
          accentColor="#f59e0b"
        />
        <KPICard
          title="Avg. Progress"
          value={`${ov?.avg_progress_score ?? 0}%`}
          subtitle="Across all check-ins"
          icon={<TrendingUp size={18} />}
          accentColor="#3b82f6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QoQ Trend Chart */}
        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Quarterly Progress Trend
          </h2>
          {analytics?.qoq_trends && analytics.qoq_trends.length > 0 ? (
            <Charts analytics={analytics} />
          ) : (
            <EmptyChart message="No quarterly check-in data yet" />
          )}
        </div>

        {/* Recent Notifications */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Recent Activity
          </h2>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>
                No notifications yet
              </p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="flex gap-3 items-start">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read_status ? 'bg-gray-600' : 'bg-indigo-400'}`}
                  />
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      {n.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {truncate(n.body, 60)}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {formatDateTime(n.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Department breakdown */}
      {analytics?.by_department && analytics.by_department.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Completion Rate by Department
          </h2>
          <Charts analytics={analytics} />
        </div>
      )}

      {/* Goals table */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {user?.role === 'employee' ? 'My Goals' : 'Team Goals'} Overview
          </h2>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{goals.length} goals</span>
        </div>
        {goals.length === 0 ? (
          <div className="text-center py-10">
            <Target size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No goals yet. Start by creating your first goal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Thrust Area</th>
                  <th>Status</th>
                  <th>Weightage</th>
                  <th>Target</th>
                </tr>
              </thead>
              <tbody>
                {goals.slice(0, 8).map((goal) => (
                  <tr key={goal.id}>
                    <td>
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                          {truncate(goal.title, 45)}
                        </p>
                        {goal.is_locked && (
                          <span className="text-[10px] text-amber-500 font-medium">🔒 Locked</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {goal.thrust_area}
                      </span>
                    </td>
                    <td><StatusBadge value={goal.status} type="goal" /></td>
                    <td>
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <ProgressBar value={goal.weightage} max={100} size="sm" className="flex-1" />
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          {goal.weightage}%
                        </span>
                      </div>
                    </td>
                    <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {goal.target}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-48 rounded-lg border border-dashed" style={{ borderColor: 'var(--border)' }}>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded" style={{ background: 'var(--surface-2)' }} />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl" style={{ background: 'var(--surface-2)' }} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="h-64 rounded-xl col-span-2" style={{ background: 'var(--surface-2)' }} />
        <div className="h-64 rounded-xl" style={{ background: 'var(--surface-2)' }} />
      </div>
    </div>
  );
}
