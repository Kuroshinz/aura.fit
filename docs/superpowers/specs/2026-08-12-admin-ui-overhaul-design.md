# Admin UI/UX Overhaul & Integration Design

## Context
The newly decoupled Admin Panel currently features a basic, unpolished UI that starkly contrasts with the main application's premium "Aura" aesthetics (glassmorphism, advanced framer-motion animations, gold gradients). Additionally, the main Dashboard page uses mock data and isolated state rather than communicating with the new Dynamic RBAC and Subscription database structures.

## Goal
Overhaul the Admin Panel to match the main app's premium design language and interconnect all admin features so they support each other dynamically.

## Architecture & Data Flow
- **Components**: We will inject `framer-motion` and `aura-glass` classes into all Admin pages and the Sidebar.
- **Data Integration**:
  - The main Admin Dashboard (`/admin`) will fetch real statistics: Total Users, Active Subscriptions, and Recent Audit Logs/System Errors.
  - Hardcoded feature flags on the dashboard will be removed or wired into the global `subscriptions` tier configurations.

## UX/UI Design Updates

### 1. Premium Admin Layout
- **Sidebar**: Add staggered entrance animations for sidebar links. Use the signature `aura-glass` background instead of flat black. Highlight active tabs with a glowing amber indicator.
- **Page Transitions**: Implement `<AnimatePresence>` for smooth fade-in and slide-up transitions when navigating between Admin tabs (Users, Roles, Subscriptions).

### 2. The Dashboard (`/admin`)
- **Metric Cards**: Display dynamic stats (Total Users, Pro Users, New Registrations) using glowing spatial cards.
- **Activity Feed**: Replace static error arrays with a real-time (or freshly fetched) feed of `system_errors` and `sync_audit_log` (from the sync engine).

### 3. Feature Cohesion
- The "Invite User" button will now open a modal that queries real `roles` to assign upon invitation.
- The "Feature Flags" section on the dashboard will be redirected to the Subscriptions tab where feature limits are actually stored.

## Verification
- Visually verify that navigating between `/admin`, `/admin/users`, and `/admin/roles` feels as smooth as the main app.
- Ensure no mock data (e.g., `setAccounts([])`) remains on the main dashboard.
