# Admin Portal Separation Design

## Context
The Admin Panel has grown robust enough that keeping it inside the main User Application (Nexus) poses security and performance concerns. The user wants to decouple the Admin Panel into a standalone web application that strictly requires an Admin Login and synchronizes with the same production Supabase database.

## Architecture
1. **Standalone App (Aura-Admin)**: A new Next.js 14 application located at `d:\Aura-Admin`.
2. **Shared Database**: Both Nexus and Aura-Admin will point to the exact same Supabase project via environment variables, ensuring 100% real-time data sync without any additional sync logic.
3. **Authentication Layer**: The Aura-Admin portal will have a dedicated `/login` route. Upon login, the app will query the `profiles` table to verify if the user's `role` is `admin` or `owner` (or query dynamic `roles` table). If unauthorized, they are kicked out.

## Migration Steps
1. **Initialize Project**: Run `npx create-next-app` to scaffold `Aura-Admin`.
2. **Install Dependencies**: Install `lucide-react`, `framer-motion`, `@tanstack/react-table`, `@supabase/supabase-js`, `zustand`, etc.
3. **Port Source Code**:
   - Copy `src/app/admin` from Nexus to `src/app/(dashboard)` in Aura-Admin.
   - Copy relevant UI components (`modules/admin-shell`, `modules/users`, `modules/exercises`).
   - Copy `repositories` and `services`.
   - Copy `lib/supabase` configs.
4. **Build Admin Login**: Create a sleek login screen that uses Supabase Auth.
5. **Cleanup Nexus**: Strip out the admin routes from the main Nexus repository to reduce bundle size and prevent accidental access.

## Verification
- Run `Aura-Admin` on `localhost:3001` and verify login works with the master admin email.
- Create an exercise in `Aura-Admin` and verify it immediately appears in the `Nexus` app (`localhost:3000`).
