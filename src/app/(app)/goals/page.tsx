'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Lock, Send, Edit2, X, ChevronDown, AlertCircle } from 'lucide-react';
import { goalsApi } from '@/lib/api/goals';
import { useAuthStore } from '@/lib/store/auth';
import { goalSchema, type GoalFormData } from '@/lib/validations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ProgressBar } from '@/components/shared/KPICard';
import { useToast } from '@/components/shared/ToastProvider';
import { THRUST_AREAS, UOM_LABELS, MAX_GOALS, TOTAL_WEIGHTAGE } from '@/constants';
import { truncate, computeWeightageTotal } from '@/lib/utils';
import type { Goal } from '@/types';

export default function GoalsPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      const data = await goalsApi.list();
      setGoals(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: { uom_type: 'min', weightage: 10, target: 1 },
  });

  const draftGoals = goals.filter((g) => g.status === 'draft' || g.status === 'revision_requested');
  const lockedGoals = goals.filter((g) => g.status === 'approved' || g.status === 'pending_approval');
  const totalWeight = computeWeightageTotal(goals.filter(g => g.status !== 'rejected').map((g) => g.weightage));
  const remainingWeight = TOTAL_WEIGHTAGE - totalWeight;
  const canAdd = goals.filter(g => g.status !== 'rejected').length < MAX_GOALS;
  const canSubmit = draftGoals.length > 0 && Math.abs(totalWeight - TOTAL_WEIGHTAGE) < 0.5;

  const openCreate = () => {
    setEditingGoal(null);
    reset({ uom_type: 'min', weightage: Math.min(remainingWeight, 20), target: 1 });
    setShowForm(true);
  };

  const openEdit = (goal: Goal) => {
    setEditingGoal(goal);
    reset({
      thrust_area: goal.thrust_area,
      title: goal.title,
      description: goal.description || '',
      uom_type: goal.uom_type,
      target: goal.target,
      weightage: goal.weightage,
    });
    setShowForm(true);
  };

  const onSubmitForm = async (data: GoalFormData) => {
    try {
      if (editingGoal) {
        const updated = await goalsApi.update(editingGoal.id, data);
        setGoals((prev) => prev.map((g) => (g.id === editingGoal.id ? updated : g)));
        toast('Goal updated successfully', 'success');
      } else {
        const created = await goalsApi.create(data);
        setGoals((prev) => [...prev, created]);
        toast('Goal created successfully', 'success');
      }
      setShowForm(false);
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await goalsApi.delete(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast('Goal deleted', 'info');
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  const submitGoals = async () => {
    setSubmitting(true);
    try {
      const res = await goalsApi.submit();
      toast(res.message, 'success');
      fetchGoals();
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl" style={{ background: 'var(--surface-2)' }} />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Goals</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Manage and submit your performance goals
          </p>
        </div>
        <div className="flex gap-2">
          {canSubmit && (
            <button
              onClick={submitGoals}
              disabled={submitting}
              className="btn-primary"
            >
              <Send size={14} />
              {submitting ? 'Submitting…' : 'Submit for Approval'}
            </button>
          )}
          {canAdd && (
            <button onClick={openCreate} className="btn-secondary">
              <Plus size={14} /> Add Goal
            </button>
          )}
        </div>
      </div>

      {/* Weightage Tracker */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Total Weightage
          </span>
          <span
            className="text-sm font-bold"
            style={{ color: Math.abs(totalWeight - 100) < 0.5 ? '#10b981' : totalWeight > 100 ? '#ef4444' : 'var(--text-primary)' }}
          >
            {totalWeight.toFixed(0)}% / 100%
          </span>
        </div>
        <ProgressBar value={totalWeight} max={100} size="lg" />
        {totalWeight < 100 && (
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            {remainingWeight.toFixed(0)}% remaining · Must equal 100% before submission
          </p>
        )}
        {totalWeight > 100 && (
          <div className="flex items-center gap-1.5 mt-2 text-red-400">
            <AlertCircle size={12} />
            <p className="text-xs">Total exceeds 100% — please reduce some weightages</p>
          </div>
        )}
        <div className="flex gap-4 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{goals.filter(g => g.status !== 'rejected').length}/{MAX_GOALS} goals used</span>
          <span>·</span>
          <span>{draftGoals.length} draft</span>
          <span>·</span>
          <span>{lockedGoals.length} approved/pending</span>
        </div>
      </div>

      {/* Business rule warnings */}
      {!canAdd && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-amber-400 text-sm border border-amber-500/20"
          style={{ background: 'rgba(245,158,11,0.08)' }}>
          <AlertCircle size={14} />
          Maximum {MAX_GOALS} goals reached. Delete a draft goal to add a new one.
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-3">
        {goals.length === 0 && (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'var(--surface-2)' }}>
              <Plus size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No goals yet</p>
            <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>
              Start by adding your first goal for this performance cycle
            </p>
            <button onClick={openCreate} className="btn-primary">
              <Plus size={14} /> Create First Goal
            </button>
          </div>
        )}

        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onEdit={() => openEdit(goal)}
            onDelete={() => deleteGoal(goal.id)}
          />
        ))}
      </div>

      {/* Goal Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-content p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h2>
              <button onClick={() => setShowForm(false)} className="opacity-60 hover:opacity-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
              <div>
                <label className="label">Thrust Area *</label>
                <select {...register('thrust_area')} className="input">
                  <option value="">Select thrust area…</option>
                  {THRUST_AREAS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.thrust_area && <p className="text-red-400 text-xs mt-1">{errors.thrust_area.message}</p>}
              </div>

              <div>
                <label className="label">Goal Title *</label>
                <input {...register('title')} className="input" placeholder="e.g. Reduce API P95 latency below 200ms" />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="label">Description</label>
                <textarea {...register('description')} className="input" rows={2} placeholder="Optional context and success criteria…" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">UOM Type *</label>
                  <select {...register('uom_type')} className="input">
                    {Object.entries(UOM_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Target Value *</label>
                  <input
                    {...register('target', { valueAsNumber: true })}
                    type="number"
                    step="any"
                    className="input"
                    placeholder="e.g. 200"
                  />
                  {errors.target && <p className="text-red-400 text-xs mt-1">{errors.target.message}</p>}
                </div>
              </div>

              <div>
                <label className="label">Weightage (%) * — Min 10%</label>
                <input
                  {...register('weightage', { valueAsNumber: true })}
                  type="number"
                  min={10}
                  max={100}
                  step={5}
                  className="input"
                  placeholder="e.g. 25"
                />
                {errors.weightage && <p className="text-red-400 text-xs mt-1">{errors.weightage.message}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
                  {isSubmitting ? 'Saving…' : editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function GoalCard({ goal, onEdit, onDelete }: { goal: Goal; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const canEdit = !goal.is_locked && goal.status !== 'approved' && goal.status !== 'pending_approval';

  return (
    <div className="glass-card p-4 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {goal.title}
            </p>
            {goal.is_locked && <Lock size={12} className="text-amber-400 flex-shrink-0" />}
            <StatusBadge value={goal.status} type="goal" />
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {goal.thrust_area} · UOM: {UOM_LABELS[goal.uom_type]} · Target: {goal.target}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <ProgressBar value={goal.weightage} max={100} size="sm" className="w-32" />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {goal.weightage}% weight
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {canEdit && (
            <>
              <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" title="Edit">
                <Edit2 size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
              <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete">
                <Trash2 size={14} className="text-red-400" />
              </button>
            </>
          )}
          {goal.description && (
            <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-white/5">
              <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </div>

      {expanded && goal.description && (
        <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          {goal.description}
        </div>
      )}
    </div>
  );
}
