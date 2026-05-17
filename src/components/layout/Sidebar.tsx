'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth';
import {
  LayoutDashboard, Target, CheckSquare, Bell, Users, ClipboardCheck,
  BarChart3, Settings, Shield, LogOut, Lock, FileText,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  // All roles
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, roles: ['employee', 'manager', 'admin'] },
  // Employee
  { href: '/goals', label: 'My Goals', icon: <Target size={16} />, roles: ['employee'] },
  { href: '/checkins', label: 'Check-ins', icon: <CheckSquare size={16} />, roles: ['employee'] },
  { href: '/notifications', label: 'Notifications', icon: <Bell size={16} />, roles: ['employee', 'manager', 'admin'] },
  // Manager
  { href: '/manager/approvals', label: 'Approvals', icon: <ClipboardCheck size={16} />, roles: ['manager', 'admin'] },
  { href: '/manager/team', label: 'My Team', icon: <Users size={16} />, roles: ['manager', 'admin'] },
  // Admin
  { href: '/admin/dashboard', label: 'Admin Overview', icon: <Shield size={16} />, roles: ['admin'] },
  { href: '/admin/unlock', label: 'Unlock Requests', icon: <Lock size={16} />, roles: ['admin'] },
  { href: '/admin/audit', label: 'Audit Logs', icon: <FileText size={16} />, roles: ['admin'] },
  { href: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={16} />, roles: ['admin'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <aside
      className="flex flex-col h-screen w-60 flex-shrink-0 border-r"
      style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}
          >
            G
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>GSTP</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Enterprise Portal</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {user.name}
            </p>
            <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
              {user.role} {user.department ? `· ${user.department}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('nav-item', isActive && 'active')}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={logout}
          className="nav-item w-full text-red-400 hover:text-red-300"
          style={{ color: '#f87171' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
