# AURA.FIT v4 Foundation & PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the AURA.FIT v4 Foundation by completing PWA integration (manifest + service worker) and fixing mobile UX with a Floating Action Button and Framer Motion Bottom Sheet.

**Architecture:** We use Next.js 16 (App Router), Framer Motion for 60fps bottom sheet animations, and standard Service Worker API for offline caching. The Quick Add FAB and Bottom Sheet will be injected at the dashboard layout level to remain persistent.

**Tech Stack:** Next.js 16, React 19, TypeScript, TailwindCSS, Framer Motion

## Global Constraints

* Priority: Performance, Mobile UX, Desktop UX, Accessibility, Clean Architecture, Offline-first, Maintainability
* Bottom Navigation keeps exactly: Dashboard, Workout, Library, Records, Menu.
* Target Lighthouse: Performance ≥ 95, Accessibility ≥ 100, Best Practices ≥ 100, SEO ≥ 100.
* Ensure backward compatibility with existing Zustand state.

---

### Task 1: PWA Service Worker & Manifest

**Files:**
- Modify: `public/manifest.json`
- Create: `public/sw.js`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: Static assets and Next.js built routes.
- Produces: Global `navigator.serviceWorker.register` inside `<RootLayout>`.

- [ ] **Step 1: Write `public/sw.js` for offline caching**

```javascript
const CACHE_NAME = 'aura-fit-v4-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) return response;
        return fetch(event.request).catch(() => new Response('Offline', { status: 503 }));
      })
  );
});
```

- [ ] **Step 2: Update `public/manifest.json`**

```json
{
  "name": "AURA.FIT",
  "short_name": "AURA.FIT",
  "description": "Premium AI Athletic Companion",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#03030a",
  "theme_color": "#03030a",
  "icons": [
    {
      "src": "/favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "/icon-192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "/icon-512.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "maskable"
    }
  ],
  "categories": ["fitness", "health", "lifestyle"],
  "lang": "vi-VN",
  "dir": "ltr"
}
```

- [ ] **Step 3: Register SW in `src/app/layout.tsx`**

Add script before closing body tag:
```tsx
import Script from 'next/script'

// Inside layout return, just above </body>:
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) { console.log('SW registered: ', registration.scope); },
                  function(err) { console.log('SW registration failed: ', err); }
                );
              });
            }
          `}
        </Script>
```

- [ ] **Step 4: Commit**

```bash
git add public/sw.js public/manifest.json src/app/layout.tsx
git commit -m "feat: setup PWA service worker and manifest"
```

---

### Task 2: Implement Quick Add FAB (Floating Action Button)

**Files:**
- Create: `src/components/layout/quick-add-fab.tsx`
- Modify: `src/app/(dashboard)/layout.tsx`

**Interfaces:**
- Consumes: `framer-motion`, `lucide-react` icons (Plus, Dumbbell, ListPlus, Edit3, Repeat).
- Produces: Fixed FAB component overlaid on mobile and desktop.

- [ ] **Step 1: Create FAB Component**

```tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Dumbbell, ListPlus, Edit3, Repeat } from 'lucide-react'

export function QuickAddFAB() {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { id: 'replace', label: 'Replace Exercise', icon: Repeat },
    { id: 'note', label: 'Add Note', icon: Edit3 },
    { id: 'set', label: 'Add Set', icon: ListPlus },
    { id: 'exercise', label: 'Add Exercise', icon: Dumbbell },
  ]

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="flex flex-col gap-3"
          >
            {actions.map((action, i) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                className="flex items-center gap-3 bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-xl shadow-xl hover:bg-slate-800 transition-colors"
              >
                <span className="text-xs font-mono font-bold">{action.label}</span>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-600">
                  <action.icon className="w-4 h-4 text-amber-400" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] z-50"
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>
          <Plus className="w-6 h-6 stroke-[3]" />
        </motion.div>
      </motion.button>
    </div>
  )
}
```

- [ ] **Step 2: Add FAB to Layout**

```tsx
import { QuickAddFAB } from '@/components/layout/quick-add-fab'

// Inside src/app/(dashboard)/layout.tsx, place `<QuickAddFAB />` right before `</ResponsiveNav>` or the main `children` container closes.
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/quick-add-fab.tsx src/app/\(dashboard\)/layout.tsx
git commit -m "feat: add animated quick action FAB"
```

---

### Task 3: Mobile Menu Drawer & Refactored Bottom Nav

**Files:**
- Modify: `src/components/layout/responsive-nav.tsx`
- Create: `src/components/layout/mobile-menu-drawer.tsx`

**Interfaces:**
- Consumes: `framer-motion` for the drawer, existing `useProfileStore` for Logout action.
- Produces: Exactly 5 bottom tabs on mobile (`slice(0, 4)` + Menu Button).

- [ ] **Step 1: Create `mobile-menu-drawer.tsx`**

```tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { User, Calculator, ShieldAlert, Settings, LogOut, X } from 'lucide-react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
  isAdmin: boolean
}

export function MobileMenuDrawer({ isOpen, onClose, onLogout, isAdmin }: DrawerProps) {
  const menuItems = [
    { label: 'Hồ Sơ (Profile)', href: '/profile', icon: User },
    { label: 'Máy Tính (Calculator)', href: '/calculator', icon: Calculator },
    { label: 'Cài Đặt (Settings)', href: '/settings', icon: Settings },
  ]
  if (isAdmin) {
    menuItems.push({ label: 'Admin Panel', href: '/admin', icon: ShieldAlert })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-[#070714] border-t border-slate-800 rounded-t-3xl z-[60] lg:hidden pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-black text-white">Menu Mở Rộng</h3>
                <button onClick={onClose} className="p-2 bg-slate-900 rounded-full text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {menuItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-white font-bold hover:bg-slate-800 transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-amber-400" />
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => { onClose(); onLogout(); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold hover:bg-red-500/20 transition-colors mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  Đăng Xuất
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Update `responsive-nav.tsx` to handle 5 specific tabs**

```tsx
import { MobileMenuDrawer } from './mobile-menu-drawer'
import { Menu as MenuIcon } from 'lucide-react'
// (Inside ResponsiveNav component)
const [drawerOpen, setDrawerOpen] = useState(false)

// Modify the `mobileBottomNav` render block to strictly filter the exact 4 primary routes:
const primaryRoutes = ['/dashboard', '/routines', '/exercises', '/records']
const bottomTabs = navItems.filter(item => primaryRoutes.includes(item.href))

// Under the tab map loop inside mobileBottomNav, add the Menu button:
{/* Menu Drawer Toggle */}
<button
  onClick={() => setDrawerOpen(true)}
  className="relative flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl text-slate-400 hover:text-amber-400 min-w-[56px] min-h-[44px] flex items-center justify-center"
>
  <MenuIcon className="w-5 h-5" />
  <span className="text-[9px] font-mono font-bold leading-tight">MENU</span>
</button>

// Before returning, insert the drawer:
<MobileMenuDrawer 
  isOpen={drawerOpen} 
  onClose={() => setDrawerOpen(false)} 
  onLogout={handleLogout} 
  isAdmin={profile?.role === 'admin'} 
/>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/mobile-menu-drawer.tsx src/components/layout/responsive-nav.tsx
git commit -m "feat: refactor mobile nav to use framer motion bottom sheet"
```
