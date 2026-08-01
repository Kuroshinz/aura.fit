# AURA.FIT v4 Advanced Workout Mechanics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Phase 2 of the AURA.FIT v4 Master Vision, including advanced set types, audio rest timers, workout notes, and undo functionality.

**Architecture:** 
- **Set Types:** Extend the Zustand `WorkoutState` to include `set_type` on individual sets. Update UI to conditionally style rows (e.g., Drop Set = red glow).
- **Rest Timer:** Connect the existing Zustand `restTimerSeconds` to a Web Audio API synthesizer that plays a beep sequence when `restTimerSeconds === 0`.
- **Undo / Auto-Save:** Implement a temporary "trash" state in Zustand or use the `ToastContainer` with a callback to restore deleted sets/exercises.

**Tech Stack:** Next.js 16, Zustand, TailwindCSS, Framer Motion, HTML5 Web Audio API, HTML5 Vibration API.

## Global Constraints

* Priority: Performance, Mobile UX, Clean Architecture, Maintainability
* Set Types: Normal, Warmup, Drop Set, Failure, Backoff, AMRAP.
* Rest Timer: Synthesized AudioContext beep (no external audio files), Vibrate if supported.
* Backward Compatibility: Old sets without `set_type` must default to 'Normal'.

---

### Task 1: Zustand Data Model Updates

**Files:**
- Modify: `src/store/use-workout-store.ts`

**Interfaces:**
- Consumes: Existing `Set` and `CompletedWorkout` interfaces.
- Produces: Updated `SetType` enum, updated `Set` interface, and new `updateSetType` action.

- [ ] **Step 1: Define `SetType` and update `Set` interface**

```typescript
// Add near the top of the file
export type SetType = 'Normal' | 'Warmup' | 'Drop Set' | 'Failure' | 'Backoff' | 'AMRAP';

// Update the Set interface
export interface Set {
  id: string
  weight_kg: number
  reps: number
  is_completed: boolean
  set_type?: SetType // New optional field for backward compatibility
}
```

- [ ] **Step 2: Add `updateSetType` to `WorkoutState` interface**

```typescript
// Inside WorkoutState interface
updateSetType: (exerciseId: string, setId: string, setType: SetType) => void
```

- [ ] **Step 3: Implement `updateSetType` in the store**

```typescript
// Inside the persist middleware object
updateSetType: (exerciseId, setId, setType) => {
  const { activeWorkout } = get()
  if (!activeWorkout) return

  const updatedExercises = activeWorkout.exercises.map((ex) => {
    if (ex.id === exerciseId) {
      return {
        ...ex,
        sets: ex.sets.map((s) => (s.id === setId ? { ...s, set_type: setType } : s)),
      }
    }
    return ex
  })

  set({ activeWorkout: { ...activeWorkout, exercises: updatedExercises } })
  // Optional: trigger cloud sync here if needed
},
```

- [ ] **Step 4: Commit**

```bash
git add src/store/use-workout-store.ts
git commit -m "feat: extend workout store with advanced set types"
```

---

### Task 2: Set Type UI & Styling

**Files:**
- Modify: `src/components/workout/exercise-log-card.tsx`

**Interfaces:**
- Consumes: `updateSetType` from `useWorkoutStore`.
- Produces: Visual indicators and a dropdown/toggle for Set Types on each row.

- [ ] **Step 1: Extract and update SetRow to include Type Selector**

```tsx
// Inside src/components/workout/exercise-log-card.tsx
// Locate the sets.map loop and add a type selector next to the Set Number

const SET_TYPE_COLORS: Record<string, string> = {
  'Normal': 'text-slate-400',
  'Warmup': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'Drop Set': 'text-orange-400 bg-orange-500/10 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]',
  'Failure': 'text-red-400 bg-red-500/10 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
  'Backoff': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'AMRAP': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
}

// In the row rendering:
<select
  value={set.set_type || 'Normal'}
  onChange={(e) => updateSetType(exercise.id, set.id, e.target.value as any)}
  className={`w-20 bg-transparent text-[10px] font-bold font-mono outline-none cursor-pointer appearance-none text-center rounded px-1 py-0.5 ${SET_TYPE_COLORS[set.set_type || 'Normal'] || ''}`}
>
  {Object.keys(SET_TYPE_COLORS).map(type => (
    <option key={type} value={type} className="bg-slate-900 text-white">{type}</option>
  ))}
</select>
```

- [ ] **Step 2: Apply dynamic styling to the row based on type**

```tsx
// Update the row container className to react to the set_type
<div
  key={set.id}
  className={`
    grid grid-cols-[auto_1fr_1fr_auto_auto] gap-2 items-center p-2 rounded-xl border transition-all duration-300
    ${set.is_completed ? 'bg-amber-400/5 border-amber-400/20' : 'bg-[#030308] border-slate-800/50'}
    ${set.set_type === 'Drop Set' ? 'border-orange-500/30' : ''}
    ${set.set_type === 'Failure' ? 'border-red-500/30' : ''}
  `}
>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/workout/exercise-log-card.tsx
git commit -m "feat: implement dynamic set type selector and styling"
```

---

### Task 3: Audio Rest Timer & Vibration

**Files:**
- Modify: `src/components/workout/rest-timer.tsx`
- Modify: `src/store/use-workout-store.ts` (if needed for audio flag)

**Interfaces:**
- Consumes: `restTimerSeconds` from `useWorkoutStore`.
- Produces: HTML5 Web Audio synthesized beeps when timer ends.

- [ ] **Step 1: Implement `playBeep` utility in `RestTimer`**

```tsx
// Inside src/components/workout/rest-timer.tsx
const playBeep = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Play 3 short beeps
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime + i * 0.4);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.4 + 0.2);
      
      osc.start(ctx.currentTime + i * 0.4);
      osc.stop(ctx.currentTime + i * 0.4 + 0.2);
    }
    
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  } catch (e) {
    console.error('Audio playback failed', e);
  }
}
```

- [ ] **Step 2: Trigger Beep on Timer End**

```tsx
// Add useEffect to watch restTimerSeconds
useEffect(() => {
  if (restTimerSeconds === 0 && isTimerActive) {
    playBeep();
    // Reset or mark timer inactive if your logic requires
  }
}, [restTimerSeconds, isTimerActive]);
```

- [ ] **Step 3: Commit**

```bash
git add src/components/workout/rest-timer.tsx
git commit -m "feat: add synthesized web audio beep and vibration to rest timer"
```
