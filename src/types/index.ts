// ─── Auth types ──────────────────────────────────────────────────────────────
export type UserRole = 'employee' | 'manager' | 'admin';

export interface AuthUser {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  manager_id?: string;
  access_token: string;
}

// ─── Goal types ───────────────────────────────────────────────────────────────
export type GoalStatus =
  | 'draft'
  | 'submitted'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'revision_requested';

export type UOMType = 'min' | 'max' | 'timeline' | 'zero_based';

export interface Goal {
  id: string;
  employee_id: string;
  thrust_area: string;
  title: string;
  description?: string;
  uom_type: UOMType;
  target: number;
  weightage: number;
  status: GoalStatus;
  is_locked: boolean;
  is_shared: boolean;
  shared_goal_group_id?: string;
  created_at: string;
  updated_at: string;
  // Enriched
  employee_name?: string;
  employee_email?: string;
  department?: string;
}

// ─── Approval types ───────────────────────────────────────────────────────────
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';

export interface GoalApproval {
  id: string;
  goal_id: string;
  manager_id: string;
  approval_status: ApprovalStatus;
  comment?: string;
  edited_target?: number;
  edited_weightage?: number;
  timestamp: string;
}

// ─── Check-in types ───────────────────────────────────────────────────────────
export type CheckinStatus = 'not_started' | 'on_track' | 'at_risk' | 'completed';

export interface QuarterlyCheckin {
  id: string;
  goal_id: string;
  quarter: number;
  year: number;
  planned_target?: number;
  actual_achievement?: number;
  progress_score?: number;
  status: CheckinStatus;
  employee_comment?: string;
  manager_comment?: string;
  created_at: string;
}

// ─── Notification types ────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read_status: boolean;
  created_at: string;
}

// ─── Audit log types ───────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  user_id?: string;
  entity_type: string;
  entity_id: string;
  action: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  timestamp: string;
}

// ─── Analytics types ───────────────────────────────────────────────────────────
export interface KPIOverview {
  total_goals: number;
  approved_goals: number;
  pending_approvals: number;
  completion_rate: number;
  avg_progress_score: number;
}

export interface DepartmentStat {
  department: string;
  total_goals: number;
  approved: number;
  completion_rate: number;
}

export interface QoQTrend {
  quarter: string;
  avg_score: number;
  completed: number;
  total: number;
}

export interface AnalyticsDashboard {
  overview: KPIOverview;
  by_department: DepartmentStat[];
  qoq_trends: QoQTrend[];
}

// ─── API response wrapper ─────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  total: number;
  skip: number;
  limit: number;
  data: T[];
}
