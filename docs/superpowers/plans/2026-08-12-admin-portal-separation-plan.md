# Admin Portal Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decouple the Admin Panel from the main Nexus app into a standalone Next.js 14 application (`aura-admin`) with its own login system, securely connected to the same Supabase backend.

**Architecture:** 
- New Monolithic Next.js 14 App Route project.
- Shared `.env.local` to point to the production database.
- Porting over specific React components and repositories.

---

### Task 1: Scaffold the New Admin Application
- [ ] **Step 1: Initialize Next.js**
Run `npx -y create-next-app@latest d:\aura-admin --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`
- [ ] **Step 2: Install Dependencies**
Navigate to `d:\aura-admin` and run `npm install @supabase/supabase-js @supabase/ssr lucide-react framer-motion @tanstack/react-table zustand uuid`
- [ ] **Step 3: Setup Environment**
Copy `.env.local` from `d:\Nexus` to `d:\aura-admin`.

### Task 2: Port Infrastructure & Services
- [ ] **Step 1: Copy Shared Libraries**
Copy `lib/supabase`, `lib/api`, and `lib/permissions` from `Nexus` to `Aura-Admin`.
- [ ] **Step 2: Copy Repositories & Services**
Copy `repositories` and `services` folders from `Nexus/src` to `Aura-Admin/src`.
- [ ] **Step 3: Copy Stores**
Copy `store/use-profile-store.ts` and `store/useExerciseStore.ts` (if needed) to `Aura-Admin`. Remove local storage sync logic that belongs to the user app.

### Task 3: Build Admin Authentication
- [ ] **Step 1: Create Login Page**
Create `src/app/login/page.tsx` with a sleek UI. Use `@supabase/ssr` to authenticate with email/password.
- [ ] **Step 2: Role Verification Middleware**
Create `src/middleware.ts` to check if a user is logged in. If they try to access `/` and are not logged in, redirect to `/login`. Upon login, verify if their role is `admin`, otherwise show unauthorized.

### Task 4: Port UI Components & Layouts
- [ ] **Step 1: Admin Shell**
Copy `modules/admin-shell` to `Aura-Admin`.
- [ ] **Step 2: Admin Layout**
Create `src/app/layout.tsx` and copy `src/app/admin/admin-client-layout.tsx` from Nexus.
- [ ] **Step 3: Admin Modules**
Copy `modules/users` and `modules/exercises`.

### Task 5: Port Pages
- [ ] **Step 1: Dashboard Page**
Copy `Nexus/src/app/admin/page.tsx` to `Aura-Admin/src/app/page.tsx`.
- [ ] **Step 2: Sub-pages**
Copy `Nexus/src/app/admin/users/page.tsx` to `Aura-Admin/src/app/users/page.tsx`. Repeat for `roles`, `subscriptions`, and `exercises`.

### Task 6: Clean Up Nexus App
- [ ] **Step 1: Delete Admin Routes**
Delete `d:\Nexus\src\app\admin`.
- [ ] **Step 2: Clean Sidebar**
Remove admin shell and unneeded admin components from `Nexus/src/modules/admin-shell`.
- [ ] **Step 3: Commit**
Commit changes on `Nexus` repo: `chore: extract admin panel to standalone aura-admin app`.
