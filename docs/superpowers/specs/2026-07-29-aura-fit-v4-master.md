# AURA.FIT v4 – Website-First Performance & UX Enhancement

## Role
You are a senior Full Stack Engineer specializing in Next.js 15, React 19, TypeScript, TailwindCSS, Framer Motion, Zustand, and Progressive Web Apps.

Your task is to improve AURA.FIT into a premium fitness web application. This is NOT a native mobile app. Every feature must be optimized for a responsive website and PWA experience.

Priority:
* Performance
* Mobile UX
* Desktop UX
* Accessibility
* Clean Architecture
* Offline-first
* Maintainability

Do not introduce unnecessary complexity.

---

# Phase 1 — Website UX

## Responsive Layout
Optimize separately for:
* Mobile (≤768px)
* Tablet
* Desktop

Do not simply scale the mobile layout. Desktop should take advantage of larger screens.

## Bottom Navigation
Keep exactly: Dashboard, Workout, Library, Records, Menu.
The Menu button opens a Bottom Sheet using Framer Motion containing: Profile, Calculator, Admin, Settings, Logout.
Animation must be smooth (60fps).

## Sticky Workout Header
When scrolling inside a workout: Display Exercise Name, Current Volume, Completed Sets, Rest Timer. The header remains visible.

## Floating Workout Controller
Always visible while a workout is active. Contains: Workout timer, Current exercise, Rest timer, Pause, Finish Workout. Never obstruct important UI.

## Swipe Navigation
Allow horizontal swipe between exercises. Desktop uses keyboard arrows.

## Quick Add
Floating Action Button Opens: Add Exercise, Add Set, Add Note, Replace Exercise. Must open instantly.

---

# Phase 2 — Workout Experience

## Set Types
Support: Normal, Warmup, Drop Set, Failure, Backoff, AMRAP.
Each has different colors. Persist in Zustand. Backward compatible with previous storage.

## Rest Timer
Auto-start after completing a set. When timer ends: Play synthesized AudioContext beep, Highlight next set, Vibrate if supported, Flash timer briefly. Must work without external audio files.

## Workout Notes
Support: Exercise Note, Session Note, Pinned Notes. Markdown is optional.

## Undo
Deleting a set or exercise shows Undo for 5 seconds.

## Auto Save
Display status: Saving..., Saved, Offline, Failed. Never lose workout progress.

---

# Phase 3 — Exercise Library
Each exercise should support: Name, Equipment, Difficulty, Primary Muscle, Secondary Muscles, Instructions, Common Mistakes, Tips, Video URL, GIF URL. Search should be instant.

---

# Phase 4 — Dashboard
Realtime statistics: Workout Duration, Workout Volume, Sets, Estimated Calories, PRs, Weekly Volume, Monthly Volume, Workout Streak, Consistency.
Display charts only when meaningful. Avoid visual clutter.

---

# Phase 5 — Performance
Refactor for minimal rendering. Implement: React.memo, useCallback, useMemo, Zustand selectors, useShallow, Lazy loading, Dynamic imports, Code splitting, Memoized dialogs. Avoid unnecessary state updates. Target: Less than 16ms rendering per interaction.

## Virtualization
If workout exceeds 20 exercises or 150 sets, automatically virtualize rendering.

## Image Optimization
Use: next/image, WebP, AVIF, Lazy Loading. Priority images only when necessary.

## Font Optimization
Self-host fonts. Preload primary font. Avoid layout shift.

---

# Phase 6 — Offline First
Use: IndexedDB instead of only localStorage. Implement: Offline Queue, Background Sync, Conflict Resolution, Automatic Sync. User should be able to complete an entire workout without internet.

---

# Phase 7 — Progressive Web App
Complete PWA support: manifest.json, Service Worker, Install Prompt, Splash Screen, Standalone Mode, Theme Color, Maskable Icons, Offline Cache. Graceful fallback if unsupported.

---

# Phase 8 — Accessibility
Meet WCAG AA. Support: Keyboard navigation, Focus indicators, ARIA labels, Screen readers, High contrast mode, Reduced motion preference.

---

# Phase 9 — Desktop Enhancements
Keyboard shortcuts: Space → Complete Set, R → Restart Rest Timer, * → Add Set, Ctrl+K → Search, Esc → Close Dialog, Arrow Keys → Navigate Exercises.

---

# Phase 10 — Developer Experience
Maintain: Strict TypeScript, Reusable components, No duplicated logic, Modular folders, Feature-based architecture, Small reusable hooks, Proper comments only where necessary.

---

# Code Quality Requirements
Every implementation must:
* be production-ready
* avoid unnecessary dependencies
* follow React best practices
* avoid prop drilling
* minimize bundle size
* optimize Lighthouse score
* support dark mode
* support responsive layouts
* preserve backward compatibility

Target Lighthouse: Performance ≥ 95, Accessibility ≥ 100, Best Practices ≥ 100, SEO ≥ 100.
The final result should feel like a premium web application comparable to Notion, Linear, Vercel Dashboard, and Hevy, while remaining a fast, responsive, installable PWA.
