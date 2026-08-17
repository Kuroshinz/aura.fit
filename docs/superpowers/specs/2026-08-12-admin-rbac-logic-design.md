# Admin RBAC & Subscriptions Database Integration Design

## Context
The `RoleBuilder` and `SubscriptionManager` UI components currently render with hardcoded data and empty event handlers. We need to wire them to the Supabase database to allow administrators to fully manage roles, permissions, and subscription tiers.

## Data Seeding
The `permissions` table is currently empty. We must execute a SQL migration/seed script to insert foundational permissions before the UI can assign them:
- `manage:users`
- `manage:roles`
- `manage:subscriptions`
- `manage:exercises`
- `manage:templates`
- `manage:media`
- `manage:settings`

## Architecture & Data Flow

### 1. Role Builder Integration
- **Fetch**: On mount, query `roles`, `permissions`, and `role_permissions` from Supabase.
- **Transform**: Convert the normalized `role_permissions` rows into a structured record map: `Record<role_id, permission_id[]>`.
- **Create/Update**: 
  - Upsert the `roles` record.
  - Delete existing `role_permissions` for the `role_id` and insert the newly selected `permission_id`s in a single transaction-like batch.
- **Delete**: Remove the role by ID. Cascade deletion in DB should handle `role_permissions`.

### 2. Subscriptions Integration
- **Fetch**: Query all rows from `subscriptions`.
- **Create/Update**: Upsert the subscription row, mapping the JSON feature limits properly.
- **Delete**: Remove by ID.

## Verification
- Saving a new Role with specific permissions correctly inserts rows into `roles` and `role_permissions`.
- Saving a Subscription reflects immediately in the UI.
- The UI handles optimistic updates or triggers a reload to reflect the exact Database state upon success.
