'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';
import type { AnalyticsDashboard } from '@/types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface Props {
  analytics: AnalyticsDashboard;
}

export default function DashboardCharts({ analytics }: Props) {
  return (
    <>
      {/* QoQ Trend */}
      {analytics.qoq_trends.length > 0 && (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={analytics.qoq_trends}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="quarter" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8 }}
              labelStyle={{ color: 'var(--text-primary)' }}
              itemStyle={{ color: '#818cf8' }}
            />
            <Area type="monotone" dataKey="avg_score" stroke="#6366f1" fill="url(#scoreGrad)" strokeWidth={2} name="Avg Score %" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </>
  );
}

export function DeptBarChart({ data }: { data: AnalyticsDashboard['by_department'] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
        <YAxis type="category" dataKey="department" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} width={90} />
        <Tooltip
          contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8 }}
          formatter={(v: any) => [`${v}%`, 'Completion']}
        />
        <Bar dataKey="completion_rate" fill="#6366f1" radius={[0, 4, 4, 0]} name="Completion %" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AdminBarChart({ data }: { data: AnalyticsDashboard['by_department'] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="department" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
        <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8 }} />
        <Bar dataKey="total_goals" fill="#6366f1" name="Total Goals" radius={[4, 4, 0, 0]} />
        <Bar dataKey="approved" fill="#10b981" name="Approved" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AdminPieChart({ data }: { data: AnalyticsDashboard['by_department'] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="completion_rate"
          nameKey="department"
          cx="50%"
          cy="50%"
          outerRadius={80}
        >
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8 }}
          formatter={(v: any) => [`${v}%`, 'Completion Rate']}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function QoQBarChart({ data }: { data: AnalyticsDashboard['qoq_trends'] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="quarter" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
        <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8 }} />
        <Bar dataKey="avg_score" fill="#6366f1" name="Avg Score %" radius={[4, 4, 0, 0]} />
        <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
