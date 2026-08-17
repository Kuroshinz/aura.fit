# Admin Templates Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Global Templates module for the Admin Panel to create, manage, and edit workout routines that users can adopt.

**Architecture:** 
- Update `routines` schema to support template flags.
- Create `TemplateBuilderSlideover` with nested `ExercisePicker`.
- Wire everything up to Supabase.

---

### Task 1: Database Migration
- [ ] **Step 1: SQL Migration Script**
Create `d:\Nexus\scripts\migrations\20260812_templates_schema.js`.
Add `is_global_template` (BOOLEAN DEFAULT false), `difficulty` (TEXT), and `tags` (JSONB) to the `routines` table.
- [ ] **Step 2: Run & Commit**

### Task 2: Models & Services Updates
- [ ] **Step 1: Routine Types**
Update `src/repositories/routines/routine-repository.ts` (if it exists) or create it in `d:\aura-admin\src\repositories\routines\routine-repository.ts`.
- [ ] **Step 2: Commit**

### Task 3: Template Slide-over & Exercise Picker
- [ ] **Step 1: Exercise Picker Component**
Create `d:\aura-admin\src\modules\templates\components\exercise-picker.tsx` to search and select exercises.
- [ ] **Step 2: Template Builder Slide-over**
Create `d:\aura-admin\src\modules\templates\components\template-builder-slideover.tsx` handling basic info + the array of `routine_exercises`.
- [ ] **Step 3: Commit**

### Task 4: Templates Page
- [ ] **Step 1: Build the Page**
Create `d:\aura-admin\src\app\(dashboard)\templates\page.tsx` using `DataTable`. Connect `supabase.from('routines')`.
- [ ] **Step 2: Commit**
