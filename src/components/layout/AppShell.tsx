'use client';

import { Sidebar } from './Sidebar';
import { useAuthStore } from '@/lib/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ToastProvider } from '@/components/shared/ToastProvider';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  if (!user) return null;

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
