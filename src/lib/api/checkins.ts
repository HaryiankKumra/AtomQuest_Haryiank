import { api } from './client';
import type { QuarterlyCheckin } from '@/types';

export const checkinsApi = {
  forGoal: (goalId: string) => api.get<QuarterlyCheckin[]>(`/api/checkins/${goalId}`),
  upsert: (data: {
    goal_id: string;
    quarter: number;
    year: number;
    planned_target?: number;
    actual_achievement?: number;
    status?: string;
    employee_comment?: string;
  }) => api.post<QuarterlyCheckin>('/api/checkins', data),
};
