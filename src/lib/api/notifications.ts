import { api } from './client';
import type { Notification } from '@/types';

export const notificationsApi = {
  list: () => api.get<Notification[]>('/api/notifications'),
  markRead: (id: string) => api.patch<{ message: string }>(`/api/notifications/${id}/read`, {}),
  markAllRead: () => api.patch<{ message: string }>('/api/notifications/read-all', {}),
};
