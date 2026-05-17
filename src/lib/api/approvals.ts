import { api } from './client';
import type { Goal } from '@/types';

export const approvalsApi = {
  pending: () => api.get<Goal[]>('/api/approvals/pending'),
  process: (goalId: string, data: {
    approval_status: string;
    comment?: string;
    edited_target?: number;
    edited_weightage?: number;
  }) => api.post<{ message: string }>(`/api/approvals/${goalId}`, data),
};
