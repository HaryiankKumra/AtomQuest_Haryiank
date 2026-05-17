import { cn } from '@/lib/utils';
import {
  GOAL_STATUS_COLORS,
  GOAL_STATUS_LABELS,
  CHECKIN_STATUS_COLORS,
  CHECKIN_STATUS_LABELS,
} from '@/constants';

interface BadgeProps {
  value: string;
  type?: 'goal' | 'checkin' | 'role';
  className?: string;
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  employee: 'bg-slate-100 text-slate-700',
};

export function StatusBadge({ value, type = 'goal', className }: BadgeProps) {
  let label = value;
  let colorClass = '';

  if (type === 'goal') {
    label = GOAL_STATUS_LABELS[value] || value;
    colorClass = GOAL_STATUS_COLORS[value] || 'bg-gray-100 text-gray-700';
  } else if (type === 'checkin') {
    label = CHECKIN_STATUS_LABELS[value] || value;
    colorClass = CHECKIN_STATUS_COLORS[value] || 'bg-gray-100 text-gray-700';
  } else if (type === 'role') {
    label = value.charAt(0).toUpperCase() + value.slice(1);
    colorClass = ROLE_COLORS[value] || 'bg-gray-100 text-gray-700';
  }

  return (
    <span className={cn('badge', colorClass, className)}>
      {label}
    </span>
  );
}
