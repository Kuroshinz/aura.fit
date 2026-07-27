import { createClient } from './client'
import { ActiveWorkout, CompletedWorkout } from '@/store/use-workout-store'

let syncTimeout: any = null

export function syncWorkoutStateToCloud(updates: {
  active_workout?: ActiveWorkout | null,
  workout_history?: CompletedWorkout[],
  personal_records?: Record<string, any>
}) {
  if (syncTimeout) {
    clearTimeout(syncTimeout)
  }

  // Debounce the cloud sync by 1.5 seconds to prevent spamming Supabase API on input keystrokes
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
        console.error('Failed to sync workout state to cloud:', error)
      } else {
        console.log('Successfully synced workout state to Supabase!')
      }
    } catch (err) {
      console.error('Error in syncWorkoutStateToCloud:', err)
    }
  }, 1500)
}
