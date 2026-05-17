import { api } from './client';
import type { AuthUser } from '@/types';

export const authApi = {
  login: (email: string, password: string) =>
    api.postPublic<AuthUser>('/api/auth/login', { email, password }),
};
