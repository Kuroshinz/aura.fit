# Admin RBAC & Subscriptions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the UI components `RoleBuilder` and `SubscriptionManager` to Supabase databases to fully persist operations.

**Architecture:** 
- Use Supabase `pg` scripts to insert default `permissions`.
- Update `src/app/(dashboard)/roles/page.tsx` with `supabase.from('roles').upsert()`.
- Update `src/app/(dashboard)/subscriptions/page.tsx` with `supabase.from('subscriptions').upsert()`.

---

### Task 1: Seed Initial Permissions
- [ ] **Step 1: Write Seed Script**
Create `d:\Nexus\scripts\migrations\seed_permissions.js` using `pg` to insert standard permissions: `manage:users`, `manage:roles`, `manage:subscriptions`, `manage:exercises`, `manage:templates`, `manage:media`, `view:analytics`, `manage:settings`.
- [ ] **Step 2: Execute & Commit**

### Task 2: Implement Role Builder Database Logic
- [ ] **Step 1: Fetch and Map Data**
Update `d:\aura-admin\src\app\(dashboard)\roles\page.tsx` to fetch `roles`, `permissions`, and `role_permissions` from Supabase and map them.
- [ ] **Step 2: Save Role Logic**
Implement `onSaveRole` to `upsert` the role, delete old mappings in `role_permissions`, and insert new mapped arrays.
- [ ] **Step 3: Delete Role Logic**
Implement `onDeleteRole`.
- [ ] **Step 4: Commit**

### Task 3: Implement Subscription Manager Database Logic
- [ ] **Step 1: Fetch Subscriptions**
Update `d:\aura-admin\src\app\(dashboard)\subscriptions\page.tsx` to fetch actual tiers.
- [ ] **Step 2: Save and Delete Logic**
Implement `onSaveSubscription` and `onDeleteSubscription` using standard Supabase operations.
- [ ] **Step 3: Commit**
