# User Data Reset (Reset All) Module Design

## Context
Users need a "Reset All Data" (Xóa tất cả dữ liệu) button so they can wipe their account's workout history, routines, personal records, and return to a fresh onboarding state — **without losing their login credentials**.

## Scope
The reset will:
1. **Delete server data (Supabase)** owned by the current user:
   - `set_logs` rows linked to the user's `workout_logs`
   - `workout_logs` rows (`user_id = me`)
   - `routine_exercises` rows linked to the user's `routines`
   - `routines` rows (`user_id = me`, keep `is_global_template = true` untouched — those are admin assets)
2. **Reset the `profiles` row** to default values (preserve `id`, `email`, `role`, `created_at`).
3. **Clear browser storage** (localStorage / IndexedDB):
   - `gym-user-profile-storage`
   - `gym-active-workout-storage`
   - `aura_custom_routine`
   - `aura_register_temp_name`
4. **Redirect to `/onboarding`** so the user starts fresh.

## Safety Measures (Anti-Misclick)
- **Password confirmation**: User must type their account email (or password) to confirm the destructive action.
- **Double confirmation modal**: First click shows a warning modal; user must explicitly confirm.
- **Loading state** while deleting, with clear feedback.

## Implementation Notes
- Since RLS may restrict direct deletes, we will attempt direct Supabase deletes from the client; if RLS blocks, we'll add an RPC (edge function / SQL) — but the standard approach is client-side deletes since the user owns their rows.
- After successful deletion, call `resetProfile()` from the profile store and clear localStorage keys listed above.
- The button will be placed in the Profile page in a "Danger Zone" section, visually distinct (red).

## Files Modified
- `src/app/(dashboard)/profile/page.tsx` — add Danger Zone UI + logic.
- Possibly `src/lib/supabase/` helper for the reset operation.

## Verification
- Log in as a test user, create workout logs + routines, click the reset button, confirm with password, and verify:
  - All workout logs, set logs, and routines disappear on refresh.
  - Profile fields reset to defaults.
  - User is redirected to onboarding and can log in again with the same credentials.
