import { useAuthStore } from '@/lib/store/auth';

// All API calls go to /api/* (Next.js route handlers)
// Works both locally and on Vercel with zero config
const API_BASE = '';

async function request<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = useAuthStore.getState().user?.access_token;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Session expired. Please sign in again.');
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/csv')) {
    return res as unknown as T;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.detail || data?.message || `Request failed: ${res.status}`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) =>
    request<void>(path, { method: 'DELETE' }),
  postPublic: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, false),
};
