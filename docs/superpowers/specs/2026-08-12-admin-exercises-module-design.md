# Admin Exercises Module Design & Storage Integration

## Context
The application needs a fully functional Admin Panel to manage exercises. Currently, exercises are stored in the database but lack rich media (videos/images) and detailed step-by-step instructions. The UI must be cohesive with the recently overhauled Admin Dashboard, featuring glassmorphism and smooth slide-over interactions.

## Architecture
- **Supabase Storage**: A new public bucket `exercise-media` will be created to host MP4, GIF, and JPG/PNG files uploaded directly from the Admin Panel.
- **Database Expansion**: The `exercises` table will be expanded to store `description`, `instructions` (JSON array), `media_urls` (JSON array), and `difficulty` level.
- **Frontend Components**:
  - `AdminExercisesPage`: Container with TanStack Data Table for filtering (by Muscle/Equipment).
  - `ExerciseSlideover`: Sliding side-panel for detailed CRUD operations.
  - `MediaUploader`: A Drag-and-Drop component integrated with Supabase Storage API.

## Data Flow
1. Admin opens the Exercise Slideover and drops a video file into the MediaUploader.
2. The client uploads the file to Supabase `exercise-media` bucket using a generated UUID filename.
3. Supabase returns the public URL.
4. The client adds the URL to the `media_urls` array of the exercise.
5. Client sends an UPDATE request to the `exercises` table via `exerciseRepository`.

## UI/UX Specifics
- The table will display small thumbnail previews if `media_urls` has items.
- Difficulty badges: Green (Beginner), Yellow (Intermediate), Red (Advanced).
- The Slideover will use `framer-motion` for smooth entrance/exit, matching the `UserDetailSlideover`.

## Security
- The `exercise-media` bucket will have RLS policies allowing public read, but restricted insert/update/delete to authenticated admins (or handled via Server Actions with service role, but client-side is faster if we verify auth token). To keep it simple, we can allow authenticated users to upload, but UI is protected by `PermissionGuard('manage:exercises')`.
