# Admin Manager: Users & Dynamic RBAC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transition the hardcoded RBAC system to a Database-Driven architecture and upgrade the Admin User Management UI with advanced features.

**Architecture:** Create new Supabase tables for roles, permissions, and subscriptions. Refactor backend services to query these tables. Upgrade the frontend UI with TanStack React Table for server-side pagination/filtering, and build the Role/Subscription Manager UI components.

**Tech Stack:** React 19, Next.js 14, Zustand, TailwindCSS, Supabase (Postgres), @tanstack/react-table.

## Global Constraints
- Do not break existing user login functionality. Ensure default fallback values for `role_id` and `subscription_id` if missing during transition.
- Use `useToastStore` for all optimistic update rollbacks.

---

### Task 1: Database Schema Migration

**Files:**
- Create: `scripts/migrations/20260812_dynamic_rbac.js`

**Interfaces:**
- Produces: New tables `roles`, `permissions`, `role_permissions`, `subscriptions`. Updated `profiles` table with foreign keys `role_id`, `subscription_id`, and a `status` column.

- [ ] **Step 1: Write the Migration Script**
Create `scripts/migrations/20260812_dynamic_rbac.js` using the existing `pg` client setup (similar to `init_db.js`).

```javascript
const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres" });

async function migrate() {
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        is_system BOOLEAN DEFAULT false
      );
      
      CREATE TABLE IF NOT EXISTS permissions (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        resource TEXT NOT NULL,
        action TEXT NOT NULL,
        UNIQUE(resource, action)
      );

      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
        permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY(role_id, permission_id)
      );

      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        tier_name TEXT UNIQUE NOT NULL,
        feature_limits JSONB DEFAULT '{}'::jsonb
      );

      ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id),
        ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id),
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
    `);
    console.log("Migration successful!");
  } catch(e) { console.error(e); process.exit(1); }
  process.exit(0);
}
migrate();
```

- [ ] **Step 2: Commit**
```bash
git add scripts/migrations/20260812_dynamic_rbac.js
git commit -m "chore(db): create dynamic rbac and subscriptions schema migration"
```

---

### Task 2: Backend Services Update

**Files:**
- Modify: `src/services/users/user-service.ts`

**Interfaces:**
- Consumes: The new database tables.
- Produces: Updated API endpoints for fetching users joined with roles and subscriptions.

- [ ] **Step 1: Update getAllUsers to Join Roles**
In `src/services/users/user-service.ts`, update `getAllUsers` to perform a join using Supabase.
```typescript
  async getAllUsers() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, username, created_at, status,
          roles ( id, name ),
          subscriptions ( id, tier_name )
        `)
      
      if (error) return { success: false, error }
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    }
  }
```

- [ ] **Step 2: Add Roles/Permissions Fetching logic**
Add `getAllRoles`, `getPermissionsForRole`, and `assignRoleToUser`.

- [ ] **Step 3: Commit**
```bash
git add src/services/users/user-service.ts
git commit -m "feat(services): update user service to query dynamic rbac tables"
```

---

### Task 3: RBAC Library Refactoring

**Files:**
- Modify: `src/lib/permissions/rbac.ts`

**Interfaces:**
- Consumes: The dynamic roles fetched from API and stored in Zustand.

- [ ] **Step 1: Refactor Static Checking**
Remove `PERMISSION_MATRIX`. Change `hasPermission` to check dynamically against an array of permissions passed in or fetched from cache.
```typescript
export function hasPermission(userPermissions: string[], requiredResource: string, requiredAction: string): boolean {
  if (!userPermissions) return false;
  return userPermissions.includes(`${requiredResource}:${requiredAction}`);
}
```

- [ ] **Step 2: Commit**
```bash
git add src/lib/permissions/rbac.ts
git commit -m "refactor(rbac): switch from static matrix to dynamic permission validation"
```

---

### Task 4: User Table & Slide-Over Panel

**Files:**
- Modify: `src/modules/users/components/user-table.tsx`
- Create: `src/modules/users/components/user-detail-slideover.tsx`

**Interfaces:**
- Consumes: `@tanstack/react-table`

- [ ] **Step 1: Build the Slide-over Component**
Create a new slide-over panel that accepts `isOpen`, `onClose`, and `userId`.

- [ ] **Step 2: Update UserTable with TanStack**
Refactor `user-table.tsx` to use `useReactTable` with filtering and pagination. Add a click handler on rows to open the `UserDetailSlideover`.

- [ ] **Step 3: Commit**
```bash
git add src/modules/users/components/
git commit -m "feat(admin): refactor user table and add detail slide-over panel"
```

---

### Task 5: Role Builder & Subscription Manager

**Files:**
- Create: `src/modules/admin-shell/components/role-builder.tsx`
- Create: `src/modules/admin-shell/components/subscription-manager.tsx`

- [ ] **Step 1: Role Builder UI**
Build the visual Permission Matrix UI allowing admins to toggle capabilities per role.

- [ ] **Step 2: Subscription Manager UI**
Build the interface to define limits (`max_routines`, etc.) as JSON objects mapping to the `subscriptions` table.

- [ ] **Step 3: Commit**
```bash
git add src/modules/admin-shell/components/
git commit -m "feat(admin): add role builder and subscription manager components"
```
