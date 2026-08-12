import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { syncStateToCloud } from '@/lib/supabase/user-sync'
import { idbStorage } from '@/lib/utils/idb-storage'

export type SetType = 'Normal' | 'Warmup' | 'Drop Set' | 'Failure' | 'Backoff' | 'AMRAP';

export interface SetItem {
  id: string
  set_number: number
  weight_kg: number
  reps: number
  is_completed: boolean
  set_type?: SetType
  previous_history?: { weight_kg: number, reps: number }
}

export interface ExerciseSession {
  exercise_id: string
  exercise_name: string
  muscle_group: string
  sets: SetItem[]
  notes?: string
}

export interface ActiveWorkout {
  routine_id?: string
  routine_name?: string
  start_time: string
  exercises: ExerciseSession[]
  session_notes?: string
}

export interface CompletedWorkout {
  id: string
  routine_id?: string
  routine_name: string
  start_time: string
  end_time: string
  duration_minutes: number
  total_volume: number
  exercises_count: number
  sets_completed: number
  exercises: ExerciseSession[]
}

interface WorkoutState {
  activeWorkout: ActiveWorkout | null
  previousState: ActiveWorkout | null
  workoutHistory: CompletedWorkout[]
  personalRecords: Record<string, { weight: number, reps: number, oneRM: number, date: string }>
  restTimerSeconds: number
  isRestTimerRunning: boolean
  showSummary: boolean
  lastCompletedWorkout: CompletedWorkout | null

  savePersonalRecord: (exerciseName: string, weight: number, reps: number, oneRM: number) => void
  startWorkout: (routineId?: string, routineName?: string) => void
  finishWorkout: () => void
  dismissSummary: () => void
  addExerciseToWorkout: (exerciseId: string, exerciseName: string, muscleGroup: string) => void
  addSet: (exerciseId: string) => void
  updateSet: (exerciseId: string, setId: string, field: 'weight_kg' | 'reps', value: number) => void
  updateSetType: (exerciseId: string, setId: string, setType: SetType) => void
  toggleCompleteSet: (exerciseId: string, setId: string) => void

  setRestTimer: (seconds: number) => void
  startRestTimer: () => void
  pauseRestTimer: () => void
  resetRestTimer: () => void
  closeRestTimer: () => void
  tickRestTimer: () => void

  removeSet: (exerciseId: string, setId: string) => void
  removeExercise: (exerciseId: string) => void
  deleteWorkout: (workoutId: string) => void
  undoLastAction: () => void
  updateExerciseNotes: (exerciseId: string, notes: string) => void
  updateSessionNotes: (notes: string) => void
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      activeWorkout: null,
      previousState: null,
      workoutHistory: [],
      personalRecords: {},
      restTimerSeconds: 60,
      isRestTimerRunning: false,
      showSummary: false,
      lastCompletedWorkout: null,

      savePersonalRecord: (exerciseName, weight, reps, oneRM) => {
        const { personalRecords } = get()
        const newPRs = {
          ...personalRecords,
          [exerciseName]: { weight, reps, oneRM, date: new Date().toISOString() }
        }
        set({ personalRecords: newPRs })
        // Sync PR immediately to ensure robust tracking
        syncStateToCloud({ personal_records: newPRs }, true)
      },

      startWorkout: (routineId, routineName) => {
        const newWorkout: ActiveWorkout = {
          routine_id: routineId,
          routine_name: routineName || 'Buổi tập tự do',
          start_time: new Date().toISOString(),
          exercises: [],
        }

        set({
          activeWorkout: newWorkout,
          showSummary: false,
          lastCompletedWorkout: null,
        })

        // Sync immediately to show active session on other devices
        syncStateToCloud({ active_workout: newWorkout }, true)
      },

      finishWorkout: () => {
        const { activeWorkout, workoutHistory } = get()
        if (!activeWorkout) return

        const endTime = new Date().toISOString()
        const startMs = new Date(activeWorkout.start_time).getTime()
        const endMs = new Date(endTime).getTime()
        const durationMinutes = Math.round((endMs - startMs) / 60000)

        const completedSets = activeWorkout.exercises.flatMap((e) => e.sets).filter((s) => s.is_completed)
        const totalVolume = completedSets.reduce((sum, s) => sum + s.weight_kg * s.reps, 0)

        const completedWorkout: CompletedWorkout = {
          id: crypto.randomUUID(),
          routine_id: activeWorkout.routine_id,
          routine_name: activeWorkout.routine_name || 'Buổi tập tự do',
          start_time: activeWorkout.start_time,
          end_time: endTime,
          duration_minutes: durationMinutes,
          total_volume: totalVolume,
          exercises_count: activeWorkout.exercises.length,
          sets_completed: completedSets.length,
          exercises: activeWorkout.exercises,
        }

        const newHistory = [completedWorkout, ...workoutHistory].slice(0, 50)

        set({
          activeWorkout: null,
          isRestTimerRunning: false,
          restTimerSeconds: 60,
          workoutHistory: newHistory,
          showSummary: true,
          lastCompletedWorkout: completedWorkout,
        })

        // Sync immediately to push final logs and clear active state
        syncStateToCloud({
          workout_history: newHistory,
          active_workout: null
        }, true)
      },

      dismissSummary: () => {
        set({ showSummary: false, lastCompletedWorkout: null })
      },

      addExerciseToWorkout: (exercise_id, exercise_name, muscle_group) => {
        const { activeWorkout, workoutHistory } = get()
        if (!activeWorkout) return

        const exists = activeWorkout.exercises.find((e) => e.exercise_id === exercise_id)
        if (exists) return

        let previousHistory = undefined
        const lastWorkoutWithEx = workoutHistory.find(w => w.exercises.some(e => e.exercise_id === exercise_id))
        if (lastWorkoutWithEx) {
           const prevEx = lastWorkoutWithEx.exercises.find(e => e.exercise_id === exercise_id)
           if (prevEx && prevEx.sets.length > 0) {
               previousHistory = { weight_kg: prevEx.sets[0].weight_kg, reps: prevEx.sets[0].reps }
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

        const updated = {
          ...activeWorkout,
          exercises: [...activeWorkout.exercises, newExercise],
        }

        set({ activeWorkout: updated })
        syncStateToCloud({ active_workout: updated })
      },

      addSet: (exerciseId) => {
        const { activeWorkout, workoutHistory } = get()
        if (!activeWorkout) return

        const updatedExercises = activeWorkout.exercises.map((ex) => {
          if (ex.exercise_id === exerciseId) {
            const nextSetNum = ex.sets.length + 1
            const lastSet = ex.sets[ex.sets.length - 1]

            let previousHistory = undefined
            const lastWorkoutWithEx = workoutHistory.find(w => w.exercises.some(e => e.exercise_id === exerciseId))
            if (lastWorkoutWithEx) {
               const prevEx = lastWorkoutWithEx.exercises.find(e => e.exercise_id === exerciseId)
               if (prevEx && prevEx.sets.length >= nextSetNum) {
                   const prevSet = prevEx.sets[nextSetNum - 1]
                   previousHistory = { weight_kg: prevSet.weight_kg, reps: prevSet.reps }
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

        const updated = { ...activeWorkout, exercises: updatedExercises }
        set({ activeWorkout: updated })
        syncStateToCloud({ active_workout: updated })
      },

      updateSet: (exerciseId, setId, field, value) => {
        const { activeWorkout } = get()
        if (!activeWorkout) return

        const updatedExercises = activeWorkout.exercises.map((ex) => {
          if (ex.exercise_id === exerciseId) {
            return {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
            }
          }
          return ex
        })

        const updated = { ...activeWorkout, exercises: updatedExercises }
        set({ activeWorkout: updated })
        syncStateToCloud({ active_workout: updated })
      },

      updateSetType: (exerciseId, setId, setType) => {
        const { activeWorkout } = get()
        if (!activeWorkout) return

        const updatedExercises = activeWorkout.exercises.map((ex) => {
          if (ex.exercise_id === exerciseId) {
            return {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? { ...s, set_type: setType } : s)),
            }
          }
          return ex
        })

        const updatedWorkout = { ...activeWorkout, exercises: updatedExercises }
        set({ activeWorkout: updatedWorkout })
        syncStateToCloud({ active_workout: updatedWorkout })
      },

      toggleCompleteSet: (exerciseId, setId) => {
        const { activeWorkout } = get()
        if (!activeWorkout) return

        let wasCompleted = false

        const updatedExercises = activeWorkout.exercises.map((ex) => {
          if (ex.exercise_id === exerciseId) {
            return {
              ...ex,
              sets: ex.sets.map((s) => {
                if (s.id === setId) {
                  wasCompleted = !s.is_completed
                  return { ...s, is_completed: wasCompleted }
                }
                return s
              }),
            }
          }
          return ex
        })

        const updated = { ...activeWorkout, exercises: updatedExercises }
        set({ activeWorkout: updated })
        syncStateToCloud({ active_workout: updated })

        if (wasCompleted) {
          const { restTimerSeconds } = get()
          const newTime = restTimerSeconds <= 0 ? 60 : restTimerSeconds;
          set({ restTimerSeconds: newTime, isRestTimerRunning: true })
        }
      },

      setRestTimer: (seconds) => {
        const validSec = typeof seconds === 'number' && !isNaN(seconds) ? seconds : 60
        set({ restTimerSeconds: validSec, isRestTimerRunning: true })
      },

      startRestTimer: () => {
        set({ isRestTimerRunning: true })
      },

      pauseRestTimer: () => {
        set({ isRestTimerRunning: false })
      },

      resetRestTimer: () => {
        set({ restTimerSeconds: 60, isRestTimerRunning: false })
      },

      closeRestTimer: () => {
        set({ restTimerSeconds: 0, isRestTimerRunning: false })
      },

      tickRestTimer: () => {
        const { restTimerSeconds } = get()
        if (restTimerSeconds > 0) {
          set({ restTimerSeconds: restTimerSeconds - 1 })
        } else {
          set({ isRestTimerRunning: false })
        }
      },

      removeSet: (exerciseId, setId) => {
        set(state => {
          if (!state.activeWorkout) return state
          
          // Deep clone the state to prevent mutations when restoring
          const previousState = JSON.parse(JSON.stringify(state.activeWorkout))

          const exercises = state.activeWorkout.exercises.map(ex =>
            ex.exercise_id !== exerciseId ? ex : { ...ex, sets: ex.sets.filter(s => s.id !== setId) }
          )
          
          return { activeWorkout: { ...state.activeWorkout, exercises }, previousState }
        })
      },

      removeExercise: (exerciseId) => {
        set(state => {
          if (!state.activeWorkout) return state
          
          const previousState = JSON.parse(JSON.stringify(state.activeWorkout))

          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: state.activeWorkout.exercises.filter(ex => ex.exercise_id !== exerciseId)
            },
            previousState
          }
        })
      },

      undoLastAction: () => {
        set(state => {
          if (!state.previousState) return state
          return {
            activeWorkout: state.previousState,
            previousState: null // clear undo stack after restoring
          }
        })
      },

      updateExerciseNotes: (exerciseId: string, notes: string) => {
        set(state => {
          if (!state.activeWorkout) return state
          const exercises = state.activeWorkout.exercises.map(ex => 
            ex.exercise_id === exerciseId ? { ...ex, notes } : ex
          )
          return { activeWorkout: { ...state.activeWorkout, exercises } }
        })
      },

      updateSessionNotes: (notes: string) => {
        set(state => {
          if (!state.activeWorkout) return state
          return { activeWorkout: { ...state.activeWorkout, session_notes: notes } }
        })
      },

      deleteWorkout: (workoutId) => {
        set(state => {
          const newHistory = state.workoutHistory.filter(w => w.id !== workoutId)
          syncStateToCloud({ workout_history: newHistory }, true)
          return { workoutHistory: newHistory }
        })
      },
    }),
    {
      name: 'gym-active-workout-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
