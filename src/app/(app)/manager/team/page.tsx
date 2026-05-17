'use client';

import { useEffect, useState } from 'react';
import { goalsApi } from '@/lib/api/goals';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ProgressBar } from '@/components/shared/KPICard';
import { truncate } from '@/lib/utils';
import { UOM_LABELS } from '@/constants';
import { Users, Search } from 'lucide-react';
import type { Goal } from '@/types';

export default function TeamPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    goalsApi.team().then(setGoals).finally(() => setLoading(false));
  }, []);

  const filtered = goals.filter((g) =>
    !search ||
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    (g.employee_name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  // Group by employee
  const byEmployee = filtered.reduce<Record<string, Goal[]>>((acc, g) => {
    const key = g.employee_name || g.employee_id;
    acc[key] = acc[key] || [];
    acc[key].push(g);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Team</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Review goals across all team members
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input pl-9 w-52"
            placeholder="Search goals or members…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} />)}
        </div>
      ) : Object.keys(byEmployee).length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No team goals found</p>
        </div>
      ) : (
        Object.entries(byEmployee).map(([employeeName, empGoals]) => {
          const emp = empGoals[0];
          const approvedCount = empGoals.filter((g) => g.status === 'approved').length;
          const totalWeight = empGoals.reduce((s, g) => s + g.weightage, 0);

          return (
            <div key={employeeName} className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
                  >
                    {employeeName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{employeeName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {emp.department} · {empGoals.length} goals · {approvedCount} approved
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ProgressBar value={totalWeight} max={100} size="sm" className="w-24" />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {totalWeight}% total
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Goal</th>
                      <th>Thrust Area</th>
                      <th>UOM</th>
                      <th>Target</th>
                      <th>Weight</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empGoals.map((g) => (
                      <tr key={g.id}>
                        <td className="font-medium text-sm">{truncate(g.title, 40)}</td>
                        <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{g.thrust_area}</td>
                        <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{UOM_LABELS[g.uom_type]}</td>
                        <td className="text-xs">{g.target}</td>
                        <td>
                          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {g.weightage}%
                          </span>
                        </td>
                        <td><StatusBadge value={g.status} type="goal" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
