# AURA.FIT v4 Exercise Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Phase 3 of the AURA.FIT v4 Master Vision by expanding the Exercise data model to include detailed metadata (instructions, mistakes, video URLs) and updating the UI for an instant, offline-first search experience.

**Architecture:** 
- **Data Model:** Expand the `Exercise` interface in `src/data/exercises-database.ts`.
- **Search:** Implement a client-side fuzzy search (or simple optimized regex/includes) in the exercise selection modal/page that re-renders within 16ms.
- **UI:** Update the Exercise Detail Drawer/Modal to display the new rich metadata using the established Framer Motion and Tailwind aesthetics.

**Tech Stack:** Next.js 16, React 19, TypeScript, TailwindCSS, Framer Motion.

## Global Constraints

* Priority: Performance, Mobile UX, Clean Architecture.
* Each exercise must support: Name, Equipment, Difficulty, Primary Muscle, Secondary Muscles, Instructions, Common Mistakes, Tips, Video URL, GIF URL.
* Target: Less than 16ms rendering per interaction (Search must be instant).
* Backward Compatibility: Any previously stored exercises in custom user lists must gracefully fall back if fields are missing.

---

### Task 1: Expand Exercise Data Model

**Files:**
- Modify: `src/data/exercises-database.ts`

**Interfaces:**
- Consumes: Existing `Exercise` interface.
- Produces: Updated `Exercise` interface with new optional rich metadata fields.

- [ ] **Step 1: Update the `Exercise` interface**

```typescript
// Inside src/data/exercises-database.ts, update the interface:
export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipment?: string
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
  secondaryMuscles?: string[]
  instructions?: string[]
  commonMistakes?: string[]
  tips?: string[]
  videoUrl?: string
  gifUrl?: string
}
```

- [ ] **Step 2: Seed sample data with new fields**

```typescript
// Add rich metadata to at least one popular exercise (e.g., Bench Press or Squat) to serve as a template.
// Example updating Bench Press:
{
  id: 'bench-press',
  name: 'Bench Press (Đẩy ngực)',
  muscleGroup: 'Ngực',
  equipment: 'Barbell',
  difficulty: 'Intermediate',
  secondaryMuscles: ['Triceps', 'Front Delts'],
  instructions: [
    'Nằm phẳng trên ghế, mắt nhìn thẳng dưới thanh đòn.',
    'Nắm thanh đòn rộng hơn vai, nhấc ra khỏi giá.',
    'Hạ đòn chậm rãi xuống giữa ngực.',
    'Đẩy mạnh đòn lên vị trí ban đầu, siết ngực.'
  ],
  commonMistakes: [
    'Nâng mông khỏi ghế.',
    'Khuỷu tay loe ra quá nhiều (90 độ) dễ gây chấn thương vai.',
    'Đập thanh đòn vào ngực.'
  ],
  tips: ['Giữ bả vai ép chặt vào nhau và xuống dưới.', 'Lấy hơi sâu khi hạ đòn và thở ra khi đẩy lên.'],
}
```

- [ ] **Step 3: Commit**

```bash
git add src/data/exercises-database.ts
git commit -m "feat: expand exercise data model with rich metadata"
```

---

### Task 2: Instant Search Implementation

**Files:**
- Modify: `src/app/(dashboard)/exercises/page.tsx` OR the specific exercise library component where search happens.

**Interfaces:**
- Consumes: The updated `EXERCISES_DATABASE`.
- Produces: A highly optimized, debounced or instantly filtered list using `useMemo`.

- [ ] **Step 1: Implement `useMemo` for instant filtering**

```tsx
// Find the component rendering the exercise list (e.g., ExercisesPage)
// Ensure the search state and filtered list are optimized:
import { useMemo, useState } from 'react'

// Replace standard filtering with a memoized version:
const [searchQuery, setSearchQuery] = useState('')

const filteredExercises = useMemo(() => {
  if (!searchQuery.trim()) return EXERCISES_DATABASE
  
  const query = searchQuery.toLowerCase().trim()
  return EXERCISES_DATABASE.filter(ex => 
    ex.name.toLowerCase().includes(query) || 
    ex.muscleGroup.toLowerCase().includes(query) ||
    (ex.equipment && ex.equipment.toLowerCase().includes(query))
  )
}, [searchQuery]) // Re-calculates ONLY when searchQuery changes, ensuring <16ms response
```

- [ ] **Step 2: Connect the Search Input**

```tsx
// Ensure the input field efficiently updates the query state without lagging the UI
<input
  type="text"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Tìm bài tập, nhóm cơ, dụng cụ..."
  className="w-full bg-[#03030a] border border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
/>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/exercises/page.tsx
# Note: Path may vary depending on where the exercise list is located
git commit -m "perf: implement instant memoized search for exercise library"
```

---

### Task 3: Rich Exercise Detail View

**Files:**
- Create/Modify: `src/components/library/exercise-detail-modal.tsx` (or update existing detail drawer)

**Interfaces:**
- Consumes: `Exercise` interface.
- Produces: A Framer Motion modal/drawer displaying the rich metadata (instructions, mistakes, chips for secondary muscles/equipment).

- [ ] **Step 1: Update the Detail View Component**

```tsx
// Render the new metadata fields if they exist
<div className="space-y-6">
  {/* Tags: Equipment, Difficulty */}
  <div className="flex flex-wrap gap-2">
    {exercise.equipment && (
      <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono text-slate-300">
        {exercise.equipment}
      </span>
    )}
    {exercise.difficulty && (
      <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-mono">
        {exercise.difficulty}
      </span>
    )}
  </div>

  {/* Instructions */}
  {exercise.instructions && exercise.instructions.length > 0 && (
    <div>
      <h4 className="text-sm font-bold text-white mb-3">Hướng Dẫn (Instructions)</h4>
      <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-400">
        {exercise.instructions.map((step, idx) => (
          <li key={idx}>{step}</li>
        ))}
      </ol>
    </div>
  )}

  {/* Common Mistakes */}
  {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
      <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" /> Sai Lầm Thường Gặp
      </h4>
      <ul className="list-disc pl-5 space-y-1 text-sm text-slate-400">
        {exercise.commonMistakes.map((mistake, idx) => (
          <li key={idx}>{mistake}</li>
        ))}
      </ul>
    </div>
  )}
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/library/exercise-detail-modal.tsx
git commit -m "feat: display rich exercise metadata in detail view"
```
