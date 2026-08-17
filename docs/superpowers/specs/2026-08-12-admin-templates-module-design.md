# Admin Templates (Giáo án) Module Design

## Context
The platform needs a way for administrators to construct "Global Templates" (pre-defined workout routines) that users can browse and adopt. The `routines` and `routine_exercises` tables exist but currently don't differentiate between user-created routines and admin-curated templates.

## Architecture & Database Updates
- **Schema Migration**: Alter the `routines` table to include a boolean column `is_global_template` (default `false`) and an `author_id` (or rely on `user_id` mapping to the admin). We'll also add a `difficulty` and `tags` JSON array to help users filter templates.
- **Data Flow**: Admin creates a Template -> saves to `routines` with `is_global_template = true`. Admin adds exercises -> saves to `routine_exercises` with `target_sets` configured.

## UI/UX Specifics
1. **Templates Dashboard (`/templates`)**:
   - A TanStack Data Table showing Template Name, Difficulty, Tags, and Exercise Count.
2. **Template Builder (Slide-over)**:
   - **Basic Info**: Name, Description, Difficulty, Tags.
   - **Workout Builder**: A rich interface to search the 1300+ database exercises and drag-and-drop them into the routine.
   - For each added exercise, the Admin can configure `target_sets` (e.g., "3 sets of 10-12 reps").
   
## Verification
- When an admin saves a template, it should be queryable by the User App when they navigate to the "Discover Routines" section.
