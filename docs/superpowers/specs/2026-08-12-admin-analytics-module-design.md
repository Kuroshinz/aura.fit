# Admin Analytics Module Design

## Context
The final major module for the admin portal is the Analytics Dashboard. This page will provide administrators with a bird's-eye view of platform health, user growth, subscription distribution, and workout engagement.

## Architecture & Libraries
- **Charting Library**: We will install `recharts` for highly customizable, responsive React charts that fit perfectly within our glassmorphism design system.
- **Data Sources (Supabase)**:
  - `profiles`: To track user registrations over time (Growth Chart).
  - `subscriptions` & `profiles`: To analyze which subscription tiers are most popular (Pie Chart).
  - `workout_logs`: To track daily active users (DAU) and workout volume (Bar Chart).

## UI/UX Specifics
1. **Analytics Dashboard (`/analytics`)**:
   - **Key Metrics Row**: Large counter cards for Total Users, Active Subscriptions, Total Workouts Logged, and Average Retention.
   - **User Growth Chart**: An Area Chart showing new user registrations grouped by month.
   - **Workout Activity Chart**: A Bar Chart showing workout logs over the past 7 days.
   - **Subscription Distribution**: A Donut Chart breaking down users by Free, Pro, and Elite tiers.

## Verification
- Navigating to `/analytics` should render the charts without crashing.
- The charts should dynamically fetch from the Supabase client.
