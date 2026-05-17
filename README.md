# AtomQuest_Haryiank

## 🏆 ATOMQUEST Hackathon 1.0 — In-House Goal Setting & Tracking Portal (GSTP)

> **Built by:** Haryiank Kumra  
> **Problem Statement:** In-House Goal Setting & Tracking Portal  
> **Stack:** Next.js 14 · TypeScript · Supabase · Tailwind CSS · Recharts

---

## 🚀 What Was Built

A **production-grade enterprise web application** that digitizes the full employee goal lifecycle — from creation and submission, through manager approval, to quarterly check-ins and performance analytics.

### ✅ Features Delivered

| Feature | Status |
|---|---|
| Employee goal creation (max 8, min 10% weightage) | ✅ |
| Weightage auto-validation (must sum to exactly 100%) | ✅ |
| Manager L1 Approval Workflow (approve/reject/request revision) | ✅ |
| Goal locking on approval (no edits without admin unlock) | ✅ |
| Quarterly Check-ins with progress scoring | ✅ |
| Admin control panel (unlock requests, audit trail, analytics) | ✅ |
| Role-based access control (Employee / Manager / Admin) | ✅ |
| Full audit log (every action tracked) | ✅ |
| Analytics dashboard with charts (QoQ trends, dept breakdown) | ✅ |
| CSV export of all goal data | ✅ |
| Shared Goals (Admin/Manager pushes dept KPI to employees) | ✅ |
| JWT authentication with 8hr sessions | ✅ |
| Dark mode premium enterprise UI | ✅ |

---

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│   Next.js 14 (App Router)       │  ← Frontend + Backend (Serverless)
│   TypeScript · Tailwind · RHF   │
│   Recharts · Zustand · Zod      │
├─────────────────────────────────┤
│   Next.js API Routes (/api/*)   │  ← Business logic, JWT auth, RBAC
│   bcryptjs · jsonwebtoken        │
├─────────────────────────────────┤
│   Supabase (PostgreSQL)         │  ← Database (7 tables)
│   RLS disabled for demo         │
└─────────────────────────────────┘
```

**Deployed entirely on Vercel** — no separate backend server needed.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (app)/
│   │   ├── dashboard/         # KPI overview + charts
│   │   ├── goals/             # Goal management (CRUD)
│   │   ├── checkins/          # Quarterly check-ins
│   │   ├── notifications/     # Notification center
│   │   ├── manager/
│   │   │   ├── approvals/     # Approval queue
│   │   │   └── team/          # Team goal overview
│   │   └── admin/
│   │       ├── dashboard/     # Admin KPI panel
│   │       ├── analytics/     # Enterprise analytics
│   │       ├── audit/         # Full audit trail
│   │       └── unlock/        # Goal unlock requests
│   └── api/                   # All Next.js route handlers
│       ├── auth/login/
│       ├── goals/
│       ├── approvals/
│       ├── checkins/
│       ├── notifications/
│       ├── analytics/
│       ├── admin/
│       └── seed/              # Demo data loader
├── components/
│   ├── layout/                # Sidebar, AppShell
│   ├── shared/                # KPICard, StatusBadge, Toast
│   └── analytics/             # Chart components (SSR-safe)
└── lib/
    ├── api/                   # Typed API client modules
    ├── store/                 # Zustand auth store
    ├── supabase.ts            # Supabase client
    ├── server-auth.ts         # JWT signing/verification
    └── server-utils.ts        # Progress engine, audit logger
```

---

## 🗄️ Database Schema (Supabase)

7 tables: `users`, `goals`, `goal_approvals`, `quarterly_checkins`, `audit_logs`, `notifications`, `shared_goal_groups`

See [`../supabase_schema.sql`](../supabase_schema.sql) for the full schema.

---

## ⚡ Local Setup

```bash
# 1. Install deps
npm install --legacy-peer-deps

# 2. Set env vars — create .env.local:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your-secret-min-32-chars

# 3. Run Supabase SQL schema (supabase_schema.sql) in Supabase SQL Editor

# 4. Start dev server
npm run dev

# 5. Seed demo data
curl -X POST http://localhost:3000/api/seed
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| 👑 Admin | `admin@gstp.dev` | `Admin@123` |
| 👔 Manager (Eng) | `manager1@gstp.dev` | `Manager@123` |
| 👔 Manager (Sales) | `manager2@gstp.dev` | `Manager@123` |
| 👤 Employee (Alex) | `emp1@gstp.dev` | `Emp@123` |
| 👤 Employee (Riya) | `emp2@gstp.dev` | `Emp@123` |
| 👤 Employee (Daniel) | `emp3@gstp.dev` | `Emp@123` |

---

## 🚀 Deploy to Vercel

1. Push this repo to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add these Environment Variables in Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
```

4. Click Deploy ✅

---

## 📋 Business Rules Enforced

- Max **8 goals** per employee per cycle
- Minimum **10% weightage** per goal
- Total weightage must equal **exactly 100%** before submission
- Goals are **locked** after manager approval
- Only **Admin** can unlock goals for revision
- **Shared goals**: title & target read-only, only weightage adjustable
- **Audit trail** on every create/update/approval/deletion

---

*Built for ATOMQUEST Hackathon 1.0 — "In-House Goal Setting & Tracking Portal"*
