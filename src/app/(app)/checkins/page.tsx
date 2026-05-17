'use client';

import { useEffect, useState } from 'react';
import { checkinsApi } from '@/lib/api/checkins';
import { goalsApi } from '@/lib/api/goals';
import { useToast } from '@/components/shared/ToastProvider';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ProgressBar } from '@/components/shared/KPICard';
import { CHECKIN_STATUS_LABELS, QUARTERS } from '@/constants';
import type { Goal, QuarterlyCheckin } from '@/types';
import { CheckSquare, ChevronDown, Loader2 } from 'lucide-react';

export default function CheckinsPage() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const currentQ = Math.ceil((new Date().getMonth() + 1) / 3);

  useEffect(() => {
    goalsApi.list()
      .then((all) => setGoals(all.filter((g) => g.status === 'approved')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Quarterly Check-ins</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Q{currentQ} {currentYear} · Update your achievement progress for approved goals
        </p>
      </div>

      {goals.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CheckSquare size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No approved goals available for check-in. Goals must be approved before check-ins can be submitted.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <GoalCheckinCard key={goal.id} goal={goal} currentQ={currentQ} currentYear={currentYear} toast={toast} />
          ))}
        </div>
      )}
    </div>
  );
}

function GoalCheckinCard({ goal, currentQ, currentYear, toast }: {
  goal: Goal;
  currentQ: number;
  currentYear: number;
  toast: (msg: string, type?: any) => void;
}) {
  const [checkins, setCheckins] = useState<QuarterlyCheckin[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    actual_achievement: '',
    planned_target: '',
    status: 'on_track' as QuarterlyCheckin['status'],
    employee_comment: '',
  });

  useEffect(() => {
    if (expanded) {
      checkinsApi.forGoal(goal.id).then(setCheckins);
    }
  }, [expanded, goal.id]);

  const currentCheckin = checkins.find((c) => c.quarter === currentQ && c.year === currentYear);

  const save = async () => {
    setSaving(true);
    try {
      await checkinsApi.upsert({
        goal_id: goal.id,
        quarter: currentQ,
        year: currentYear,
        planned_target: form.planned_target ? Number(form.planned_target) : undefined,
        actual_achievement: form.actual_achievement ? Number(form.actual_achievement) : undefined,
        status: form.status,
        employee_comment: form.employee_comment || undefined,
      });
      const updated = await checkinsApi.forGoal(goal.id);
      setCheckins(updated);
      toast('Check-in saved successfully', 'success');
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (currentCheckin) {
      setForm({
        actual_achievement: String(currentCheckin.actual_achievement ?? ''),
        planned_target: String(currentCheckin.planned_target ?? ''),
        status: currentCheckin.status,
        employee_comment: currentCheckin.employee_comment || '',
      });
    }
  }, [currentCheckin]);

  return (
    <div className="glass-card overflow-hidden">
      <div
        className="p-4 flex items-center gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {goal.title}
            </p>
            <StatusBadge value={goal.status} type="goal" />
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {goal.thrust_area} · Target: {goal.target} · Weight: {goal.weightage}%
          </p>
        </div>
        <div className="flex items-center gap-3">
          {currentCheckin?.progress_score !== undefined && (
            <div className="flex items-center gap-2">
              <ProgressBar value={currentCheckin.progress_score} max={100} size="sm" className="w-24" />
              <span className="text-xs font-semibold text-emerald-400">
                {currentCheckin.progress_score}%
              </span>
            </div>
          )}
          <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

      {expanded && (
        <div className="border-t p-4 space-y-5" style={{ borderColor: 'var(--border)' }}>
          {/* Previous quarters */}
          {checkins.filter((c) => !(c.quarter === currentQ && c.year === currentYear)).length > 0 && (
            <div>
              <p className="label mb-2">Previous Quarters</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {checkins.filter((c) => !(c.quarter === currentQ && c.year === currentYear)).map((c) => (
                  <div key={c.id} className="rounded-lg p-3" style={{ background: 'var(--surface-2)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Q{c.quarter} {c.year}
                    </p>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      {c.progress_score ?? '—'}%
                    </p>
                    <StatusBadge value={c.status} type="checkin" />
                    {c.manager_comment && (
                      <p className="text-xs mt-1.5 italic" style={{ color: 'var(--text-muted)' }}>
                        "{c.manager_comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current quarter form */}
          <div>
            <p className="label mb-3">Q{currentQ} {currentYear} Update</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Planned Target (Q{currentQ})</label>
                <input
                  type="number"
                  step="any"
                  className="input"
                  placeholder={`e.g. ${goal.target * 0.25}`}
                  value={form.planned_target}
                  onChange={(e) => setForm((f) => ({ ...f, planned_target: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Actual Achievement *</label>
                <input
                  type="number"
                  step="any"
                  className="input"
                  placeholder="What did you achieve?"
                  value={form.actual_achievement}
                  onChange={(e) => setForm((f) => ({ ...f, actual_achievement: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="label">Status</label>
              <div className="flex gap-2 flex-wrap">
                {(['not_started', 'on_track', 'at_risk', 'completed'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, status: s }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      form.status === s
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                        : 'border-transparent hover:border-white/10'
                    }`}
                    style={{ background: form.status === s ? undefined : 'var(--surface-2)' }}
                  >
                    {CHECKIN_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <label className="label">Comments (optional)</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Add context about your progress, blockers, or next steps…"
                value={form.employee_comment}
                onChange={(e) => setForm((f) => ({ ...f, employee_comment: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button onClick={save} disabled={saving} className="btn-primary">
                {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : 'Save Check-in'}
              </button>
              {currentCheckin && (
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Last updated: Q{currentCheckin.quarter} · Score: {currentCheckin.progress_score ?? '—'}%
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
