# Admin Exercises Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete CRUD (Create, Read, Update, Delete) interface for Exercises in the Admin Panel, including media upload capabilities to Supabase Storage.

**Architecture:** 
- Supabase SQL Migration to expand `exercises` table and create the `exercise-media` Storage Bucket.
- Expand `exercise-repository.ts` to handle rich text, arrays, and media strings.
- Frontend components: `AdminExercisesPage`, `ExerciseDetailSlideover`, and a `MediaUploader`.

## Global Constraints
- Use `@/lib/supabase/client` for all client-side uploads.
- The Slideover must handle full editing capabilities (Name, Target Muscle, Equipment, Difficulty, Description, Instructions, and Media).

---

### Task 1: Database Migration (Schema & Storage)
- [ ] **Step 1: SQL Migration Script**
Write a Node script (`scripts/migrations/20260812_exercise_schema.js`) to:
1. Add columns to `exercises` table: 
   - `description` (TEXT)
   - `instructions` (JSONB) - Default `[]`
   - `media_urls` (JSONB) - Default `[]`
   - `difficulty` (TEXT) - Default `'beginner'`
2. Create Supabase Storage bucket `exercise-media` (Public = true).
- [ ] **Step 2: Commit**

### Task 2: Update Repository & Store Models
- [ ] **Step 1: Update ExerciseRecord Interface**
Modify `src/repositories/exercises/exercise-repository.ts` to type the new columns.
- [ ] **Step 2: Update API Service**
Add update/delete/create functions to the repository or service layer.
- [ ] **Step 3: Commit**

### Task 3: Build Media Uploader Component
- [ ] **Step 1: Create Uploader UI**
Create `src/modules/exercises/components/media-uploader.tsx`. A dropzone that uses Supabase storage `upload()` API and returns the public URL.
- [ ] **Step 2: Commit**

### Task 4: Build Exercise Slide-over & Edit Form
- [ ] **Step 1: Exercise Slide-over**
Create `src/modules/exercises/components/exercise-slideover.tsx`. Include form fields for Name, Muscle, Equipment, Difficulty, Description, and dynamic array inputs for Instructions.
- [ ] **Step 2: Commit**

### Task 5: Upgrade Exercises Page
- [ ] **Step 1: TanStack Table Setup**
Refactor `src/app/admin/exercises/page.tsx` to display all fields, filter by Muscle/Equipment, and trigger the Slide-over.
- [ ] **Step 2: Commit**
