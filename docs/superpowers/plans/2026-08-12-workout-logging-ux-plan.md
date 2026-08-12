# Workout Logging UX Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimize the Workout Logging UX with a Compact Grid layout, inline previous history, and smart auto-advance focus.

**Architecture:** We will enhance `ExerciseSession` and `SetItem` in the Zustand store to optionally hold previous history. Then, we will rewrite the Sets list in `exercise-log-card.tsx` to use a dense grid layout (Compact Grid) with inline history display. We will implement auto-advance using React `useRef` to handle the focus progression between inputs.

**Tech Stack:** React 19, Next.js 14, Zustand, TailwindCSS, Framer Motion.

## Global Constraints
- Target mobile viewport widths primarily (min 320px). Use precise tailwind grid/flex classes.
- Maintain existing Framer Motion animations.
- Ensure the changes don't break the active persist store.

---

### Task 1: Store Enhancement for Previous History

**Files:**
- Modify: `src/store/use-workout-store.ts`

**Interfaces:**
- Consumes: Existing `WorkoutState` and `workoutHistory`.
- Produces: Updated `SetItem` type with `previous_history?: { weight_kg: number, reps: number }`.

- [ ] **Step 1: Update the SetItem Type**
Modify `SetItem` in `src/store/use-workout-store.ts` to include `previous_history`.
```typescript
export interface SetItem {
  id: string
  set_number: number
  weight_kg: number
  reps: number
  is_completed: boolean
  set_type?: SetType
  previous_history?: { weight_kg: number, reps: number }
}
```

- [ ] **Step 2: Inject History in addExerciseToWorkout**
Update `addExerciseToWorkout` in `use-workout-store.ts`. Before creating the new set, find the last time this exercise was performed by scanning `workoutHistory` (search for `exercise_id`). If found, grab the first set's `weight_kg` and `reps` and assign it to `previous_history`.
```typescript
      addExerciseToWorkout: (exercise_id, exercise_name, muscle_group) => {
        const { activeWorkout, workoutHistory } = get()
        if (!activeWorkout) return

        const exists = activeWorkout.exercises.find((e) => e.exercise_id === exercise_id)
        if (exists) return

        // Find previous history
        let previousHistory = undefined;
        const lastWorkoutWithEx = workoutHistory.find(w => w.exercises.some(e => e.exercise_id === exercise_id));
        if (lastWorkoutWithEx) {
           const prevEx = lastWorkoutWithEx.exercises.find(e => e.exercise_id === exercise_id);
           if (prevEx && prevEx.sets.length > 0) {
               previousHistory = { weight_kg: prevEx.sets[0].weight_kg, reps: prevEx.sets[0].reps };
           }
        }

        const newExercise: ExerciseSession = {
          exercise_id,
          exercise_name,
          muscle_group,
          sets: [
            {
              id: crypto.randomUUID(),
              set_number: 1,
              weight_kg: 0,
              reps: 0,
              is_completed: false,
              previous_history: previousHistory
            },
          ],
        }
```

- [ ] **Step 3: Inject History in addSet**
Update `addSet`. If the user adds set N, grab set N from the previous history (if it exists) and assign it.
```typescript
      addSet: (exerciseId) => {
        const { activeWorkout, workoutHistory } = get()
        if (!activeWorkout) return

        const updatedExercises = activeWorkout.exercises.map((ex) => {
          if (ex.exercise_id === exerciseId) {
            const nextSetNum = ex.sets.length + 1
            const lastSet = ex.sets[ex.sets.length - 1]
            
            // Find previous history for this specific set number
            let previousHistory = undefined;
            const lastWorkoutWithEx = workoutHistory.find(w => w.exercises.some(e => e.exercise_id === exerciseId));
            if (lastWorkoutWithEx) {
               const prevEx = lastWorkoutWithEx.exercises.find(e => e.exercise_id === exerciseId);
               if (prevEx && prevEx.sets.length >= nextSetNum) {
                   const prevSet = prevEx.sets[nextSetNum - 1];
                   previousHistory = { weight_kg: prevSet.weight_kg, reps: prevSet.reps };
               }
            }

            return {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  id: crypto.randomUUID(),
                  set_number: nextSetNum,
                  weight_kg: lastSet ? lastSet.weight_kg : 0,
                  reps: lastSet ? lastSet.reps : 0,
                  is_completed: false,
                  previous_history: previousHistory
                },
              ],
            }
          }
          return ex
        })
```

### Task 2: Compact Grid & Inline History UI

**Files:**
- Modify: `src/components/workout/exercise-log-card.tsx`

**Interfaces:**
- Consumes: The new `previous_history` field in `set`.

- [ ] **Step 1: Rewrite the Set Items List to a Dense Grid**
In `src/components/workout/exercise-log-card.tsx`, locate the `Set Items List` mapping (`exerciseSession.sets.map(...)`).
Update the layout to be much denser. Reduce padding from `p-2 sm:p-3` to `p-1 sm:p-2`.

- [ ] **Step 2: Display Inline History**
Inside the map, underneath the inputs (or in the first column), display the `previous_history`.
```tsx
  {set.previous_history && (
    <div className="absolute -bottom-4 left-0 w-full text-center">
      <span className="text-[9px] text-slate-500 whitespace-nowrap">
        (Prev: {set.previous_history.weight_kg}kg x {set.previous_history.reps})
      </span>
    </div>
  )}
```
*Note: You will need to wrap the input columns in relative wrappers with enough bottom padding/margin so the absolute text doesn't overlap.*

### Task 3: Auto-Advance Numpad Focus

**Files:**
- Modify: `src/components/workout/exercise-log-card.tsx`

- [ ] **Step 1: Add inputMode and refs**
In `exercise-log-card.tsx`, at the top of the component, we don't necessarily need a complex ref array if we can use DOM traversal.
For the `weight_kg` and `reps` inputs, add `inputMode="decimal"` and `enterKeyHint="next"`.

- [ ] **Step 2: Add onKeyDown handler**
Implement a keydown handler on the inputs to detect "Enter" (Next).
```tsx
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentType: 'weight' | 'reps', setId: string) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const formElements = Array.from(document.querySelectorAll('input, button'));
    const index = formElements.indexOf(e.currentTarget);
    if (index > -1 && index + 1 < formElements.length) {
       (formElements[index + 1] as HTMLElement).focus();
    }
  }
}
```
Attach this handler to both Weight and Reps inputs. This provides a very fast native-like auto-advance.
