-- ============================================================
-- GSTP — ATOMQUEST HACKATHON — Supabase PostgreSQL Schema
-- 
-- HOW TO USE:
--   1. Go to https://supabase.com/dashboard/project/wbdhfcorsjbojlkwfpkt
--   2. Click "SQL Editor" in the left sidebar
--   3. Paste this ENTIRE file and click "Run"
--   4. Then go to your app and hit POST /api/seed to load demo data
-- ============================================================

-- Drop existing tables (safe re-run)
drop table if exists public.notifications cascade;
drop table if exists public.audit_logs cascade;
drop table if exists public.quarterly_checkins cascade;
drop table if exists public.goal_approvals cascade;
drop table if exists public.goals cascade;
drop table if exists public.shared_goal_groups cascade;
drop table if exists public.users cascade;

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── 1. Users ─────────────────────────────────────────────────
create table public.users (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text unique not null,
  password_hash text not null,
  role         text not null check (role in ('employee','manager','admin')) default 'employee',
  department   text,
  manager_id   uuid references public.users(id) on delete set null,
  created_at   timestamptz default now()
);

-- ── 2. Shared Goal Groups ────────────────────────────────────
create table public.shared_goal_groups (
  id          uuid primary key default gen_random_uuid(),
  created_by  uuid references public.users(id) on delete set null,
  department  text not null,
  title       text not null,
  target      float not null,
  created_at  timestamptz default now()
);

-- ── 3. Goals ─────────────────────────────────────────────────
create table public.goals (
  id                   uuid primary key default gen_random_uuid(),
  employee_id          uuid references public.users(id) on delete cascade not null,
  thrust_area          text not null,
  title                text not null,
  description          text,
  uom_type             text not null check (uom_type in ('min','max','timeline','zero_based')) default 'min',
  target               float not null,
  weightage            float not null check (weightage >= 0 and weightage <= 100),
  status               text not null check (status in (
    'draft','submitted','pending_approval','approved','rejected','revision_requested'
  )) default 'draft',
  is_locked            boolean not null default false,
  is_shared            boolean not null default false,
  shared_goal_group_id uuid references public.shared_goal_groups(id) on delete set null,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ── 4. Goal Approvals ────────────────────────────────────────
create table public.goal_approvals (
  id               uuid primary key default gen_random_uuid(),
  goal_id          uuid references public.goals(id) on delete cascade not null,
  manager_id       uuid references public.users(id) not null,
  approval_status  text not null check (approval_status in (
    'pending','approved','rejected','revision_requested'
  )) default 'pending',
  comment          text,
  edited_target    float,
  edited_weightage float,
  timestamp        timestamptz default now()
);

-- ── 5. Quarterly Check-ins ───────────────────────────────────
create table public.quarterly_checkins (
  id                 uuid primary key default gen_random_uuid(),
  goal_id            uuid references public.goals(id) on delete cascade not null,
  quarter            int not null check (quarter between 1 and 4),
  year               int not null,
  planned_target     float,
  actual_achievement float,
  progress_score     float,
  status             text not null check (status in (
    'not_started','on_track','at_risk','completed'
  )) default 'not_started',
  employee_comment   text,
  manager_comment    text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now(),
  unique (goal_id, quarter, year)
);

-- ── 6. Audit Logs ────────────────────────────────────────────
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete set null,
  entity_type text not null,
  entity_id   uuid not null,
  action      text not null,
  old_values  jsonb,
  new_values  jsonb,
  timestamp   timestamptz default now()
);

-- ── 7. Notifications ─────────────────────────────────────────
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete cascade not null,
  title       text not null,
  body        text not null,
  read_status boolean not null default false,
  created_at  timestamptz default now()
);

-- ── Indexes ───────────────────────────────────────────────────
create index idx_goals_employee on public.goals(employee_id);
create index idx_goals_status on public.goals(status);
create index idx_goals_locked on public.goals(is_locked);
create index idx_approvals_goal on public.goal_approvals(goal_id);
create index idx_approvals_manager on public.goal_approvals(manager_id);
create index idx_checkins_goal on public.quarterly_checkins(goal_id);
create index idx_notifications_user on public.notifications(user_id, read_status);
create index idx_audit_entity on public.audit_logs(entity_type, entity_id);
create index idx_audit_timestamp on public.audit_logs(timestamp desc);

-- ── Disable RLS (allows anon/publishable key full access) ────
-- For production, enable RLS and add policies per user session.
-- For hackathon demo: RLS off, auth enforced at API route level via JWT.
alter table public.users disable row level security;
alter table public.goals disable row level security;
alter table public.goal_approvals disable row level security;
alter table public.quarterly_checkins disable row level security;
alter table public.audit_logs disable row level security;
alter table public.notifications disable row level security;
alter table public.shared_goal_groups disable row level security;

-- ── Grant full access to anon role ───────────────────────────
grant all on public.users to anon, authenticated, service_role;
grant all on public.goals to anon, authenticated, service_role;
grant all on public.goal_approvals to anon, authenticated, service_role;
grant all on public.quarterly_checkins to anon, authenticated, service_role;
grant all on public.audit_logs to anon, authenticated, service_role;
grant all on public.notifications to anon, authenticated, service_role;
grant all on public.shared_goal_groups to anon, authenticated, service_role;

-- ── Success message ───────────────────────────────────────────
select 'GSTP Schema created successfully! Now call POST /api/seed to load demo data.' as status;
