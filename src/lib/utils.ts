import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getProgressColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

export function getProgressTextColor(score: number): string {
  if (score >= 90) return 'text-emerald-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-600';
}

export function computeWeightageTotal(weightages: number[]): number {
  return weightages.reduce((sum, w) => sum + w, 0);
}

export function getQuarterLabel(q: number, year?: number): string {
  return `Q${q}${year ? ` ${year}` : ''}`;
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}…` : str;
}
