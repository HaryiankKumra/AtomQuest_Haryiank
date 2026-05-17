import { z } from 'zod';
import { MIN_WEIGHTAGE } from '@/constants';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const goalSchema = z.object({
  thrust_area: z.string().min(1, 'Thrust area is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(300),
  description: z.string().optional(),
  uom_type: z.enum(['min', 'max', 'timeline', 'zero_based']),
  target: z.number({ message: 'Target is required' }).positive('Target must be positive'),
  weightage: z
    .number({ message: 'Weightage is required' })
    .min(MIN_WEIGHTAGE, `Minimum weightage is ${MIN_WEIGHTAGE}%`)
    .max(100, 'Weightage cannot exceed 100%'),
});

export const checkinSchema = z.object({
  planned_target: z.number().optional(),
  actual_achievement: z.number().optional(),
  status: z.enum(['not_started', 'on_track', 'at_risk', 'completed']),
  employee_comment: z.string().optional(),
});

export const approvalSchema = z.object({
  approval_status: z.enum(['approved', 'rejected', 'revision_requested']),
  comment: z.string().optional(),
  edited_target: z.number().positive().optional().nullable(),
  edited_weightage: z
    .number()
    .min(MIN_WEIGHTAGE)
    .max(100)
    .optional()
    .nullable(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type GoalFormData = z.infer<typeof goalSchema>;
export type CheckinFormData = z.infer<typeof checkinSchema>;
export type ApprovalFormData = z.infer<typeof approvalSchema>;
