# Admin UI Overhaul & Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the Admin Dashboard UI to match the main app's premium aesthetics and integrate the dashboard with real database tables.

**Architecture:** Use `framer-motion` for page layout transitions. Replace the hardcoded state in `src/app/admin/page.tsx` with Supabase queries to `profiles` and `roles`.

**Tech Stack:** React 19, Next.js 14, Framer Motion, TailwindCSS, Supabase.

## Global Constraints
- Use `aura-glass` classes where applicable for the frosted glass effect.
- Ensure all Supabase calls in Server Components use `@/lib/supabase/server` or Client Components use `@/lib/supabase/client`.

---

### Task 1: Refactor Admin Dashboard (Data & Layout)

**Files:**
- Modify: `src/app/admin/page.tsx`

**Interfaces:**
- Consumes: `profiles`, `roles`, `subscriptions` from Supabase.
- Produces: A clean dashboard with real metrics.

- [ ] **Step 1: Cleanup and Real Data Fetching**
Rewrite `src/app/admin/page.tsx` to fetch total users and roles.
```tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, Users, Activity, ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminPage() {
  const [stats, setStats] = useState({ users: 0, roles: 0, subscriptions: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()
      const [uRes, rRes, sRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('roles').select('id', { count: 'exact' }),
        supabase.from('subscriptions').select('id', { count: 'exact' })
      ])
      setStats({
        users: uRes.count || 0,
        roles: rRes.count || 0,
        subscriptions: sRes.count || 0
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-amber-500" />
          Command Center
        </h1>
        <p className="text-slate-400 mt-1">Platform overview and real-time metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="aura-glass p-6 rounded-2xl border border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl"><Users className="w-6 h-6 text-amber-500" /></div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase">Total Users</p>
              <p className="text-3xl font-black text-white">{loading ? '...' : stats.users}</p>
            </div>
          </div>
        </div>
        <div className="aura-glass p-6 rounded-2xl border border-indigo-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl"><ShieldAlert className="w-6 h-6 text-indigo-400" /></div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase">Custom Roles</p>
              <p className="text-3xl font-black text-white">{loading ? '...' : stats.roles}</p>
            </div>
          </div>
        </div>
        <div className="aura-glass p-6 rounded-2xl border border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl"><Activity className="w-6 h-6 text-emerald-400" /></div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase">Active Tiers</p>
              <p className="text-3xl font-black text-white">{loading ? '...' : stats.subscriptions}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/admin/page.tsx
git commit -m "feat(admin): overhaul dashboard with real metrics and animations"
```

---

### Task 2: Page Transition Animations

**Files:**
- Modify: `src/app/admin/layout.tsx`

**Interfaces:**
- Wrap `children` in an `<AnimatePresence>` and `motion.div`.

- [ ] **Step 1: Add Framer Motion wrapper**
Update `src/app/admin/layout.tsx` to handle route transitions.
```tsx
'use client'

import { AdminSidebar } from '@/modules/admin-shell/components/admin-sidebar';
import { ToastContainer } from '@/components/effects/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex font-sans selection:bg-amber-500/30">
      <AdminSidebar />
      <main className="flex-1 ml-64 min-w-0 bg-[#03030a] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto p-6 md:p-10"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <ToastContainer />
    </div>
  );
}
```
*(Remove metadata export since it becomes a Client Component, or extract a server layout wrapper)*

- [ ] **Step 2: Keep Metadata in Server Layout**
Since `layout.tsx` exports metadata, we must split it. Rename the current layout to `admin-client-layout.tsx` and import it into `layout.tsx`.
Create `src/app/admin/admin-client-layout.tsx`:
```tsx
'use client'
import { AdminSidebar } from '@/modules/admin-shell/components/admin-sidebar';
import { ToastContainer } from '@/components/effects/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function AdminClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex font-sans selection:bg-amber-500/30">
      <AdminSidebar />
      <main className="flex-1 ml-64 min-w-0 bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.05),rgba(255,255,255,0))]">
        <AnimatePresence mode="wait">
          <motion.div key={pathname} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="max-w-7xl mx-auto p-6 md:p-10">
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <ToastContainer />
    </div>
  );
}
```
Update `src/app/admin/layout.tsx`:
```tsx
import { Metadata } from 'next';
import { AdminClientLayout } from './admin-client-layout';

export const metadata: Metadata = {
  title: 'AURA.FIT Enterprise Admin',
  description: 'Enterprise control center for AURA.FIT',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
```

- [ ] **Step 3: Commit**
```bash
git add src/app/admin/layout.tsx src/app/admin/admin-client-layout.tsx
git commit -m "feat(admin): add smooth page transition animations and premium background"
```
