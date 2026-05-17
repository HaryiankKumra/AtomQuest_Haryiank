import { api } from './client';
import type { AnalyticsDashboard } from '@/types';

export const analyticsApi = {
  overview: () => api.get<AnalyticsDashboard>('/api/analytics/overview'),
};

export const adminApi = {
  users: () => api.get<any[]>('/api/admin/users'),
  lockedGoals: () => api.get<any[]>('/api/admin/locked-goals'),
  unlockGoal: (goalId: string) => api.post<{ message: string }>(`/api/admin/goals/${goalId}/unlock`, {}),
  auditLogs: (params: { entity_type?: string; skip?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params.entity_type) q.set('entity_type', params.entity_type);
    if (params.skip !== undefined) q.set('skip', String(params.skip));
    if (params.limit !== undefined) q.set('limit', String(params.limit));
    return api.get<{ data: any[]; total: number; skip: number; limit: number }>(
      `/api/admin/audit-logs?${q.toString()}`
    );
  },
  exportCSV: () => '/api/admin/export',
};
