'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, X, Edit2, MessageSquare, Loader2, ClipboardCheck } from 'lucide-react';
import { approvalsApi } from '@/lib/api/approvals';
import { useToast } from '@/components/shared/ToastProvider';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { approvalSchema, type ApprovalFormData } from '@/lib/validations';
import { UOM_LABELS } from '@/constants';
import { truncate } from '@/lib/utils';
import type { Goal } from '@/types';

export default function ApprovalsPage() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionGoal, setActionGoal] = useState<Goal | null>(null);
  const [defaultAction, setDefaultAction] = useState<'approved' | 'rejected' | 'revision_requested'>('approved');

  const fetch = useCallback(async () => {
    try {
      const data = await approvalsApi.pending();
      setGoals(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openAction = (goal: Goal, action: typeof defaultAction) => {
    setActionGoal(goal);
    setDefaultAction(action);
  };

  const onComplete = () => {
    setActionGoal(null);
    fetch();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Approvals Queue</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Review and action goal submissions from your team
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ClipboardCheck size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No pending approvals</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            You're all caught up. Your team's goal submissions will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm"
            style={{ background: 'rgba(245,158,11,0.08)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
            <ClipboardCheck size={14} /> {goals.length} goal{goals.length !== 1 ? 's' : ''} pending your review
          </div>

          <div className="space-y-3">
            {goals.map((goal) => (
              <div key={goal.id} className="glass-card p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {goal.title}
                      </p>
                      <StatusBadge value={goal.status} type="goal" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      {[
                        { label: 'Thrust Area', value: goal.thrust_area },
                        { label: 'UOM Type', value: UOM_LABELS[goal.uom_type] },
                        { label: 'Target', value: goal.target },
                        { label: 'Weightage', value: `${goal.weightage}%` },
                      ].map((item) => (
                        <div key={item.label} className="rounded-lg p-2.5" style={{ background: 'var(--surface-2)' }}>
                          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                            {item.label}
                          </p>
                          <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {goal.description && (
                      <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
                        {truncate(goal.description, 120)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => openAction(goal, 'approved')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}
                    >
                      <Check size={12} /> Approve
                    </button>
                    <button
                      onClick={() => openAction(goal, 'revision_requested')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}
                    >
                      <Edit2 size={12} /> Request Revision
                    </button>
                    <button
                      onClick={() => openAction(goal, 'rejected')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      <X size={12} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Action Modal */}
      {actionGoal && (
        <ApprovalModal
          goal={actionGoal}
          defaultAction={defaultAction}
          onClose={() => setActionGoal(null)}
          onComplete={onComplete}
          toast={toast}
        />
      )}
    </div>
  );
}

function ApprovalModal({ goal, defaultAction, onClose, onComplete, toast }: {
  goal: Goal;
  defaultAction: 'approved' | 'rejected' | 'revision_requested';
  onClose: () => void;
  onComplete: () => void;
  toast: (msg: string, type?: any) => void;
}) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      approval_status: defaultAction,
      edited_target: null,
      edited_weightage: null,
    },
  });

  const action = watch('approval_status');

  const onSubmit = async (data: ApprovalFormData) => {
    try {
      await approvalsApi.process(goal.id, {
        approval_status: data.approval_status,
        comment: data.comment,
        edited_target: data.edited_target || undefined,
        edited_weightage: data.edited_weightage || undefined,
      });
      const labels: Record<string, string> = { approved: 'approved', rejected: 'rejected', revision_requested: 'revision requested' };
      toast(`Goal ${labels[data.approval_status]} successfully`, data.approval_status === 'approved' ? 'success' : 'info');
      onComplete();
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Review Goal
          </h2>
          <button onClick={onClose} className="opacity-60 hover:opacity-100"><X size={18} /></button>
        </div>

        <div className="rounded-lg p-3 mb-4" style={{ background: 'var(--surface-2)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{goal.title}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Target: {goal.target} · Weightage: {goal.weightage}% · UOM: {UOM_LABELS[goal.uom_type]}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Action *</label>
            <select {...register('approval_status')} className="input">
              <option value="approved">Approve</option>
              <option value="revision_requested">Request Revision</option>
              <option value="rejected">Reject</option>
            </select>
          </div>

          {action === 'approved' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Override Target (optional)</label>
                  <input
                    {...register('edited_target', { valueAsNumber: true, setValueAs: v => v === '' ? null : Number(v) })}
                    type="number"
                    step="any"
                    className="input"
                    placeholder={`${goal.target} (current)`}
                  />
                </div>
                <div>
                  <label className="label">Override Weightage % (optional)</label>
                  <input
                    {...register('edited_weightage', { valueAsNumber: true, setValueAs: v => v === '' ? null : Number(v) })}
                    type="number"
                    min={10}
                    max={100}
                    className="input"
                    placeholder={`${goal.weightage} (current)`}
                  />
                  {errors.edited_weightage && <p className="text-red-400 text-xs mt-1">{errors.edited_weightage.message}</p>}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="label">Comment {action !== 'approved' ? '*' : '(optional)'}</label>
            <textarea
              {...register('comment')}
              className="input"
              rows={3}
              placeholder={
                action === 'approved'
                  ? 'Commend the effort or add notes…'
                  : action === 'revision_requested'
                  ? 'Explain what needs to be changed…'
                  : 'Provide a reason for rejection…'
              }
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 justify-center"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
              {isSubmitting ? 'Processing…' : 'Confirm Action'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
