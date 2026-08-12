# Admin Manager: Users & Dynamic RBAC Design

## Context
The current Admin Dashboard has a hardcoded Role-Based Access Control (RBAC) matrix and a basic user table. To support a SaaS business model and enterprise scalability, we need to transition to a Database-Driven (Dynamic) RBAC system, complete with Subscriptions and an advanced User Management interface.

## Architecture & Database Schema

The core logic shifts from hardcoded arrays to the Supabase Postgres Database.

### 1. New Tables
- **`roles`**: `id` (UUID), `name` (TEXT), `description` (TEXT), `is_system` (BOOLEAN).
- **`permissions`**: `id` (UUID), `resource` (TEXT - e.g., 'users', 'exercises'), `action` (TEXT - e.g., 'create', 'read', 'update', 'delete').
- **`role_permissions`**: `role_id` (UUID), `permission_id` (UUID).
- **`subscriptions`**: `id` (UUID), `tier_name` (TEXT - e.g., 'Free', 'Pro'), `feature_limits` (JSONB - e.g., `{ max_routines: 3, has_ai_coach: true }`).

### 2. Modified Tables
- **`profiles`**: Add `role_id` (UUID), `subscription_id` (UUID), `status` (TEXT: 'active', 'suspended', 'banned').

### 3. Data Flow & Performance
- **Caching**: The Frontend will cache the user's evaluated permissions inside the Zustand `useProfileStore`.
- **API Security**: Next.js Server Actions and Supabase RLS will query the `role_permissions` to validate access on the backend.

## UI / UX Design

### 1. User Management Dashboard
- **Component**: `modules/users/components/user-table.tsx` will be upgraded using `@tanstack/react-table`.
- **Features**: Server-side pagination, multi-condition filtering (e.g., Role + Status), and search.
- **User Detail Panel**: A slide-over (drawer) replacing standard page navigation. It will show user metrics, audit logs, and action buttons (Ban, Reset Password, Assign Role).

### 2. Role & Permission Builder
- **Component**: `modules/admin-shell/components/role-builder.tsx`.
- **Features**: A visual Permission Matrix. Rows represent features/resources, columns represent Roles. Toggling a checkbox updates the `role_permissions` table. Supports creating new Custom Roles.

### 3. Subscription Manager
- **Component**: `modules/admin-shell/components/subscription-manager.tsx`.
- **Features**: UI to define feature limits stored in the `subscriptions` JSONB column.

## Error Handling & Edge Cases
- **System Roles**: Roles with `is_system = true` (like `owner`) cannot be deleted or have their core permissions removed, preventing accidental admin lockouts.
- **Optimistic Updates**: User table role updates will be applied optimistically and reverted if the API call fails, showing a toast notification.

## Testing Strategy
- Create automated API tests for the new database structure and RLS policies.
- Manually verify the Slide-over panel behavior on mobile viewports for the Admin dashboard.
