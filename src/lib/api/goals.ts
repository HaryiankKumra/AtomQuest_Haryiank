import { api } from './client';
import type { Goal } from '@/types';

export const goalsApi = {
  list: () => api.get<Goal[]>('/api/goals'),
  create: (data: any) => api.post<Goal>('/api/goals', data),
  update: (id: string, data: any) => api.patch<Goal>(`/api/goals/${id}`, data),
  delete: (id: string) => api.delete(`/api/goals/${id}`),
  submit: () => api.post<{ message: string }>('/api/goals/submit', {}),
  team: () => api.get<Goal[]>('/api/goals/team'),
};
