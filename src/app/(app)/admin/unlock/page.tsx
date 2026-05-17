'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/analytics';
import { useToast } from '@/components/shared/ToastProvider';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Lock, Unlock, Search } from 'lucide-react';
import type { Goal } from '@/types';
import { truncate, formatDateTime } from '@/lib/utils';

export default function UnlockPage() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLocked = () => adminApi.lockedGoals().then(setGoals).finally(() => setLoading(false));
  useEffect(() => { fetchLocked(); }, []);

  const unlock = async (goalId: string) => {
    try {
      await adminApi.unlockGoal(goalId);
      toast('Goal unlocked successfully', 'success');
      fetchLocked();
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  const filtered = goals.filter((g) =>
    !search || g.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Unlock Requests</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Manage locked goals — admin-only operation
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input pl-9 w-52" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Lock size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No locked goals found</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Goal Title</th>
                <th>Employee ID</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Lock size={12} className="text-amber-400 flex-shrink-0" />
                      <span className="font-medium text-sm">{truncate(g.title, 45)}</span>
                    </div>
                  </td>
                  <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{g.employee_id?.slice(0, 8)}…</td>
                  <td><StatusBadge value={g.status} type="goal" /></td>
                  <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateTime(g.created_at)}</td>
                  <td>
                    <button
                      onClick={() => unlock(g.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
                    >
                      <Unlock size={11} /> Unlock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
