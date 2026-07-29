# AURA.FIT v3: Advanced Mechanics, PWA, and Mobile UI Optimization

## 1. Overview
This document outlines the design and architecture for a major update to AURA.FIT. The goal is to deliver a native-app-like experience on mobile web, fix navigation overflow issues, introduce advanced lifting mechanics (Drop Sets, Warmups), and drastically improve frontend rendering performance.

## 2. Architecture & Components

### Phase 1: Mobile Navigation & PWA
*   **Mobile Bottom Nav (Drawer Pattern):** 
    *   Modify `src/components/layout/responsive-nav.tsx`.
    *   Hardcode the visible mobile bottom tabs to 4 primary items: Dashboard, Lịch Tập, Thư Viện, Kỷ Lục.
    *   Introduce a 5th item: "Menu".
    *   When "Menu" is clicked, trigger a `framer-motion` sliding Bottom Sheet/Drawer containing the remaining routes (Profile, Calculator, Admin Panel) and the Logout action.
*   **Progressive Web App (PWA):**
    *   Finalize `public/manifest.json` with correct icons, theme colors (`#03030a`), and `standalone` display mode.
    *   Create `public/sw.js` (Service Worker) to cache static assets and fulfill the PWA installability requirements for iOS/Android.
    *   Register the Service Worker in `src/app/layout.tsx`.
*   **UI Polish:**
    *   Add `AnimatePresence` page transitions to `layout.tsx` for smooth, native-like routing.

### Phase 2: Advanced Workout Mechanics
*   **Zustand Data Model:**
    *   Update `WorkoutState` in `src/store/use-workout-store.ts`.
    *   Add `set_type?: 'normal' | 'warmup' | 'drop_set' | 'failure'` to the Set interface.
    *   Add an update action to handle changing set types.
*   **Workout UI Updates:**
    *   In `src/components/workout/exercise-log-card.tsx`, add a context menu/dropdown next to the Set number to select the `set_type`.
    *   Apply conditional CSS classes based on type (e.g., Orange/Red glow for Drop Sets, Blue for Warmup).
*   **Audio Rest Timer:**
    *   Update `src/store/use-workout-store.ts` tick mechanism or the `WorkoutPage` component to monitor `restTimerSeconds`.
    *   When the timer transitions from `1` to `0`, use the HTML5 `AudioContext` (synthesized beep) to alert the user. This avoids needing external MP3 files.

### Phase 3: Performance & Rendering
*   **Component Memoization:**
    *   Extract the individual Set row from `exercise-log-card.tsx` into a `SetRow` component.
    *   Wrap `SetRow` and `ExerciseLogCard` in `React.memo`.
    *   Use `useCallback` for `updateSet` and `toggleCompleteSet` handlers to prevent unnecessary re-renders of the entire workout list during data entry.

## 3. Error Handling & Constraints
*   **Service Worker:** Must fail gracefully if the browser does not support `navigator.serviceWorker`.
*   **Audio Context:** iOS Safari requires user interaction to play audio. The synthesized beep must be initialized upon the user's first click (e.g., clicking "Complete Set") to unlock the audio context.
*   **Zustand Persist:** The new `set_type` field must be backward compatible with existing cached local storage data (defaulting to 'normal' if undefined).

## 4. Verification Plan
*   Load app on a mobile viewport and verify exactly 5 icons appear in the bottom nav, with the 5th opening a drawer.
*   Check Lighthouse PWA score (should pass installability requirements).
*   Log an active workout, change a set to "Drop Set", verify visual change.
*   Complete a set, wait for the rest timer, verify audio beep plays without screen interaction.
