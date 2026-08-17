# User Data Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Reset All Data" (Xóa tất cả dữ liệu) button in the user Profile page that wipes server data (workout logs, set logs, routines) and browser storage while preserving the login account.

**Architecture:**
- Add a `resetAllUserData` helper in `src/lib/supabase/user-data-reset.ts`.
- Add a "Danger Zone" UI section in `src/app/(dashboard)/profile/page.tsx` with email confirmation modal.
- Wire up store resets + localStorage clearing + redirect to `/onboarding`.

---

### Task 1: Create Reset Helper
- [ ] **Step 1: Create `src/lib/supabase/user-data-reset.ts`**
  - Function `resetAllUserData(userId: string)`:
    1. Find all `workout_logs` ids for the user → delete `set_logs` where `workout_log_id in (...)`
    2. Delete `workout_logs` where `user_id = userId`
    3. Find all `routines` ids for `user_id = userId` AND `is_global_template = false` → delete `routine_exercises` where `routine_id in (...)`
    4. Delete those `routines`
    5. Reset `profiles` row: set `age`, `gender`, `height_cm`, `weight_kg`, `body_fat`, `experience`, `goal`, `sessions_per_week`, `workout_history`, `personal_records`, `active_workout`, `exercise_state`, `metrics_history`, `telegram_chat_id`, `auto_send_routine` to defaults (keep `id`, `email`, `role`, `created_at`, `full_name`)
- [ ] **Step 2: Commit**

### Task 2: Add Danger Zone UI to Profile
- [ ] **Step 1: Add state** `resetModalOpen`, `resetEmailInput`, `isResetting`, `resetError`
- [ ] **Step 2: Add modal UI** (AnimatePresence modal with red theme):
  - Warning text explaining irreversible action
  - Input to type email to confirm
  - Confirm button (disabled unless email matches)
  - Cancel button
- [ ] **Step 3: Add handler** `handleFullReset`:
  - Call `resetAllUserData(profile.id)`
  - Clear localStorage keys (`gym-user-profile-storage`, `gym-active-workout-storage`, `aura_custom_routine`, `aura_register_temp_name`)
  - `resetProfile()`
  - `router.push('/onboarding')`
- [ ] **Step 4: Commit**

### Task 3: Verify
- [ ] **Step 1: Run `npm run build`** to verify type-check passes
- [ ] **Step 2: Commit final**
