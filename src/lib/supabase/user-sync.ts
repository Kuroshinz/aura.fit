import { createClient } from './client'
import { ActiveWorkout, CompletedWorkout } from '@/store/use-workout-store'

let syncTimeout: any = null

export function syncStateToCloud(updates: {
  active_workout?: ActiveWorkout | null,
  workout_history?: CompletedWorkout[],
  personal_records?: Record<string, any>,
  exercise_state?: any,
  age?: number,
  gender?: string,
  height_cm?: number,
  weight_kg?: number,
  body_fat?: number | null,
  experience?: string,
  goal?: string,
  sessions_per_week?: number
}) {
  if (syncTimeout) {
    clearTimeout(syncTimeout)
  }

  // Debounce the cloud sync by 1.5 seconds to prevent spamming API on rapid changes
  syncTimeout = setTimeout(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        console.error('Failed to sync state to cloud:', error)
      } else {
        console.log('Successfully synced state to Supabase!')
      }
    } catch (err) {
      console.error('Error in syncStateToCloud:', err)
    }
  }, 1500)
}
