import { cn, getProgressColor, getProgressTextColor } from '@/lib/utils';
import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  accentColor?: string;
  className?: string;
}

export function KPICard({ title, value, subtitle, icon, trend, accentColor = '#6366f1', className }: KPICardProps) {
  return (
    <div className={cn('kpi-card', className)}>
      <div className="flex items-start justify-between">
        <p className="label">{title}</p>
        {icon && (
          <div
            className="p-2 rounded-lg"
            style={{ background: `${accentColor}18`, color: accentColor }}
          >
            {icon}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      )}
      {trend && (
        <div className={cn('flex items-center gap-1 text-xs font-medium',
          trend.value >= 0 ? 'text-emerald-400' : 'text-red-400')}>
          <span>{trend.value >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}% {trend.label}</span>
        </div>
      )}
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({ value, max = 100, showLabel = false, size = 'md', className }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  const height = size === 'sm' ? '4px' : size === 'lg' ? '10px' : '6px';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="progress-track flex-1" style={{ height }}>
        <div
          className={cn('progress-fill', getProgressColor(pct))}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn('text-xs font-semibold w-10 text-right', getProgressTextColor(pct))}>
          {pct.toFixed(0)}%
        </span>
      )}
    </div>
  );
}
