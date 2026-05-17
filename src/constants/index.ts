// API is served by Next.js route handlers at /api/*

export const MAX_GOALS = 8;
export const MIN_WEIGHTAGE = 10;
export const TOTAL_WEIGHTAGE = 100;

export const QUARTERS = [1, 2, 3, 4];

export const GOAL_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  revision_requested: 'Revision Requested',
};

export const GOAL_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  submitted: 'bg-blue-100 text-blue-700',
  pending_approval: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  revision_requested: 'bg-orange-100 text-orange-700',
};

export const UOM_LABELS: Record<string, string> = {
  min: 'Min (Higher is Better)',
  max: 'Max (Lower is Better)',
  timeline: 'Timeline',
  zero_based: 'Zero-Based',
};

export const CHECKIN_STATUS_LABELS: Record<string, string> = {
  not_started: 'Not Started',
  on_track: 'On Track',
  at_risk: 'At Risk',
  completed: 'Completed',
};

export const CHECKIN_STATUS_COLORS: Record<string, string> = {
  not_started: 'bg-slate-100 text-slate-600',
  on_track: 'bg-emerald-100 text-emerald-700',
  at_risk: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
};

export const THRUST_AREAS = [
  'Technical Excellence',
  'Leadership',
  'Delivery',
  'Innovation',
  'Customer Success',
  'Revenue',
  'Pipeline',
  'Learning & Development',
  'Process Improvement',
  'Compliance & Risk',
];

export const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'HR',
  'Finance',
  'Product',
  'Operations',
  'Legal',
];

export const SEED_CREDENTIALS = [
  { role: 'Admin', email: 'admin@gstp.dev', password: 'Admin@123' },
  { role: 'Manager (Eng)', email: 'manager1@gstp.dev', password: 'Manager@123' },
  { role: 'Manager (Sales)', email: 'manager2@gstp.dev', password: 'Manager@123' },
  { role: 'Employee (Alex)', email: 'emp1@gstp.dev', password: 'Emp@123' },
  { role: 'Employee (Riya)', email: 'emp2@gstp.dev', password: 'Emp@123' },
  { role: 'Employee (Daniel)', email: 'emp3@gstp.dev', password: 'Emp@123' },
];
