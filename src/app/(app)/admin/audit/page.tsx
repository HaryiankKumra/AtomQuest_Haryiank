'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/analytics';
import { formatDateTime } from '@/lib/utils';
import { FileText, Search, Filter } from 'lucide-react';
import type { AuditLog, PaginatedResponse } from '@/types';

const ENTITY_TYPES = ['', 'goal', 'checkin', 'approval'];

export default function AuditPage() {
  const [data, setData] = useState<PaginatedResponse<AuditLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [entityType, setEntityType] = useState('');
  const [skip, setSkip] = useState(0);
  const limit = 20;

  const fetchLogs = (et = entityType, s = skip) => {
    setLoading(true);
    adminApi.auditLogs({ entity_type: et || undefined, skip: s, limit })
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleFilter = (et: string) => {
    setEntityType(et);
    setSkip(0);
    fetchLogs(et, 0);
  };

  const ACTION_COLORS: Record<string, string> = {
    created: 'text-emerald-400',
    updated: 'text-blue-400',
    deleted: 'text-red-400',
    submitted: 'text-amber-400',
    approval_approved: 'text-emerald-400',
    approval_rejected: 'text-red-400',
    unlocked: 'text-purple-400',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Audit Logs</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Full audit trail of all system events · {data?.total ?? 0} total entries
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter size={14} style={{ color: 'var(--text-muted)' }} />
        <div className="flex gap-2">
          {ENTITY_TYPES.map((et) => (
            <button
              key={et || 'all'}
              onClick={() => handleFilter(et)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                entityType === et
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'btn-secondary text-xs py-1.5'
              }`}
            >
              {et || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Entity</th>
              <th>Action</th>
              <th>Entity ID</th>
              <th>Old Value</th>
              <th>New Value</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Loading…</td></tr>
            ) : data?.data.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No logs found</td></tr>
            ) : (
              data?.data.map((log) => (
                <tr key={log.id}>
                  <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateTime(log.timestamp)}</td>
                  <td>
                    <span className="badge bg-slate-100 text-slate-700 capitalize">{log.entity_type}</span>
                  </td>
                  <td>
                    <span className={`text-xs font-semibold ${ACTION_COLORS[log.action] || 'text-gray-400'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {log.entity_id.slice(0, 8)}…
                  </td>
                  <td className="text-xs max-w-[140px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {log.old_values ? JSON.stringify(log.old_values) : '—'}
                  </td>
                  <td className="text-xs max-w-[140px] truncate" style={{ color: 'var(--text-secondary)' }}>
                    {log.new_values ? JSON.stringify(log.new_values) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.total > limit && (
          <div className="px-4 py-3 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Showing {skip + 1}–{Math.min(skip + limit, data.total)} of {data.total}
            </span>
            <div className="flex gap-2">
              <button
                disabled={skip === 0}
                onClick={() => { const s = Math.max(0, skip - limit); setSkip(s); fetchLogs(entityType, s); }}
                className="btn-secondary text-xs py-1.5 disabled:opacity-40"
              >
                ← Previous
              </button>
              <button
                disabled={skip + limit >= data.total}
                onClick={() => { const s = skip + limit; setSkip(s); fetchLogs(entityType, s); }}
                className="btn-secondary text-xs py-1.5 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
