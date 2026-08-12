# Admin, Routing, and Sync Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix routing post-login, ensure workout deletions sync to the cloud, implement an automated error reporting system via Telegram, refine access permissions with RLS, and expand the Admin Control Panel for diagnostics.

**Architecture:** 
- Next.js middleware and root page redirects will be updated to point to `/dashboard`.
- `useWorkoutStore` will call `syncStateToCloud` when deleting workouts to persist deletions to Supabase.
- A global React `<ErrorBoundary>` will catch unhandled client exceptions and send them to a new `/api/report-error` route.
- The Python Webhook will process `error_detected` events and send alerts to the Admin's Telegram chat.
- Supabase Row Level Security (RLS) policies will be updated to properly restrict `profiles` access based on the `role` field.
- The Admin page will get a new "System Diagnostics & Error Logs" section fetching data from a new `system_errors` Supabase table.

**Tech Stack:** Next.js 15, React 19, Supabase (RLS & Edge Functions/API), Zustand, Telegram Bot API.

## Global Constraints

- Must maintain Next.js App Router conventions.
- Error boundary must not break the app; it should show a graceful fallback UI.
- Admin RLS policies must strictly prevent standard users from reading other users' profiles.
- Telegram webhook payload format must remain backward compatible.

---

### Task 1: Fix Routing & Redirects

**Files:**
- Modify: `src/lib/supabase/middleware.ts`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: Next.js `NextResponse.redirect`
- Produces: Correct URL routing to `/dashboard`

- [ ] **Step 1: Update Root Page Redirect**

```tsx
// src/app/page.tsx
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/dashboard')
}
```

- [ ] **Step 2: Update Middleware Redirect**

Modify `src/lib/supabase/middleware.ts` to redirect authenticated users to `/dashboard` instead of `/workout` on Auth pages.

```typescript
// Replace '/workout' with '/dashboard'
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
```

- [ ] **Step 3: Commit**
```bash
git add src/lib/supabase/middleware.ts src/app/page.tsx
git commit -m "fix(routing): redirect logged in users and root to dashboard"
```

---

### Task 2: Fix Workout Deletion Sync

**Files:**
- Modify: `src/store/use-workout-store.ts`

**Interfaces:**
- Consumes: `syncStateToCloud` from `src/lib/supabase/user-sync.ts`

- [ ] **Step 1: Add sync call to `deleteWorkout`**

Modify the `deleteWorkout` function inside `src/store/use-workout-store.ts` so it syncs the new `workoutHistory` array immediately after filtering it.

```typescript
      deleteWorkout: (workoutId) => {
        set(state => {
          const newHistory = state.workoutHistory.filter(w => w.id !== workoutId)
          // Sync deletion to cloud immediately
          syncStateToCloud({ workout_history: newHistory }, true)
          return { workoutHistory: newHistory }
        })
      },
```

- [ ] **Step 2: Commit**
```bash
git add src/store/use-workout-store.ts
git commit -m "fix(sync): push workout deletions to supabase"
```

---

### Task 3: Create Automated Error Detection & Reporting

**Files:**
- Create: `supabase/migrations/09_system_errors.sql`
- Create: `src/components/effects/error-boundary.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/app/api/report-error/route.ts`

**Interfaces:**
- Consumes: React `Component` for error boundary.
- Produces: Webhook POST to Python server with `event_type="error_detected"`.

- [ ] **Step 1: Create Supabase Table for Errors**

Create `supabase/migrations/09_system_errors.sql`:
```sql
CREATE TABLE IF NOT EXISTS public.system_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    user_agent TEXT,
    resolved BOOLEAN DEFAULT FALSE
);
ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage errors" ON public.system_errors FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Anyone can insert errors" ON public.system_errors FOR INSERT WITH CHECK (true);
```

- [ ] **Step 2: Create Next.js API Route for Error Webhook**

Create `src/app/api/report-error/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { sendTelegramWebhook } from '@/lib/telegram-webhook'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // 1. Send to Telegram using Webhook
    await sendTelegramWebhook({
      event_type: 'test_notification', // Fallback to existing type to ensure compatibility
      user_email: 'System',
      user_name: 'AURA.FIT Monitor',
      title: '⚠️ SYSTEM ERROR DETECTED',
      message: `Error: ${body.message}\n\nStack: ${body.stack?.substring(0, 200)}...`,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
```

- [ ] **Step 3: Create Global Error Boundary**

Create `src/components/effects/error-boundary.tsx`:
```tsx
'use client'
import React from 'react'
import { createClient } from '@/lib/supabase/client'

export class GlobalErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to Supabase
    const supabase = createClient()
    supabase.from('system_errors').insert([{
      error_message: error.message,
      error_stack: info.componentStack,
      user_agent: navigator.userAgent
    }]).then(() => {
      // Trigger Webhook alert
      fetch('/api/report-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: error.message, stack: info.componentStack })
      })
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center mt-20">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong.</h2>
          <p className="text-slate-400">Our team has been notified and is looking into it.</p>
          <button onClick={() => window.location.href = '/'} className="mt-6 px-4 py-2 bg-amber-500 text-black rounded-lg">Return to App</button>
        </div>
      )
    }
    return this.props.children
  }
}
```

- [ ] **Step 4: Wrap layout in Error Boundary**

In `src/app/layout.tsx`, import `GlobalErrorBoundary` and wrap `{children}` inside it.

- [ ] **Step 5: Commit**
```bash
git add supabase/migrations/09_system_errors.sql src/components/effects/error-boundary.tsx src/app/api/report-error/route.ts src/app/layout.tsx
git commit -m "feat(errors): implement automated error detection and admin notification"
```

---

### Task 4: Reconfigure Access Permissions (RLS)

**Files:**
- Modify: `supabase/migrations/08_admin_roles.sql` (or create a new migration for RLS)

**Interfaces:**
- Consumes: Supabase RLS

- [ ] **Step 1: Restrict Profile Access**

Create `supabase/migrations/10_restrict_profiles_rls.sql`:
```sql
-- Drop the insecure policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create strict policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Admins can view and update all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
```

- [ ] **Step 2: Commit**
```bash
git add supabase/migrations/10_restrict_profiles_rls.sql
git commit -m "chore(security): enforce strict RLS for profiles based on admin role"
```

---

### Task 5: Expand Admin Control Panel

**Files:**
- Modify: `src/app/(dashboard)/admin/page.tsx`

**Interfaces:**
- Consumes: `system_errors` table

- [ ] **Step 1: Add System Diagnostics UI**

In `admin/page.tsx`, fetch errors from `system_errors` and add a new section "SYSTEM DIAGNOSTICS & ERROR LOGS" below the "SYSTEM FEATURE FLAGS" section.
It should display a table of recent errors, their timestamps, and a "Mark Resolved" button that updates the `resolved` boolean in Supabase.

```tsx
// Inside AdminPage component
const [errors, setErrors] = useState<any[]>([])

const fetchErrors = async () => {
  const supabase = createClient()
  const { data } = await supabase.from('system_errors').select('*').order('created_at', { ascending: false }).limit(20)
  if (data) setErrors(data)
}

useEffect(() => {
  // ... existing code
  fetchErrors()
}, [])

const resolveError = async (id: string) => {
  const supabase = createClient()
  await supabase.from('system_errors').update({ resolved: true }).eq('id', id)
  fetchErrors()
}
// Render the errors table below the Feature Flags block...
```

- [ ] **Step 2: Commit**
```bash
git add src/app/\(dashboard\)/admin/page.tsx
git commit -m "feat(admin): add system diagnostics and error resolution panel"
```
