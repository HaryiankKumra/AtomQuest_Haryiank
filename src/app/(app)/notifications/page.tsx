'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationsApi } from '@/lib/api/notifications';
import { useToast } from '@/components/shared/ToastProvider';
import { formatDateTime } from '@/lib/utils';
import type { Notification } from '@/types';

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.list().then(setNotifications).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read_status: true })));
    toast('All notifications marked as read', 'success');
  };

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read_status: true } : n));
  };

  const unreadCount = notifications.filter((n) => !n.read_status).length;

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-xs">
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read_status && markRead(n.id)}
              className="glass-card p-4 flex gap-3 cursor-pointer transition-all duration-200 hover:border-indigo-500/30"
              style={{ opacity: n.read_status ? 0.7 : 1 }}
            >
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.read_status ? 'bg-gray-600' : 'bg-indigo-400 animate-pulse'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {formatDateTime(n.created_at)}
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
