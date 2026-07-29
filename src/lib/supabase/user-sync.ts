import { createClient } from './client'

let syncTimeout: any = null

export interface SyncUpdates {
  active_workout?: any | null,
  workout_history?: any[],
  personal_records?: Record<string, any>,
  exercise_state?: any,
  age?: number,
  gender?: string,
  height_cm?: number,
  weight_kg?: number,
  body_fat?: number | null,
  experience?: string,
  goal?: string,
  sessions_per_week?: number,
  telegram_chat_id?: string,
  auto_send_routine?: boolean,
  metrics_history?: any[]
}

export function syncStateToCloud(
  updates: SyncUpdates,
  immediate = false
) {
  if (syncTimeout) {
    clearTimeout(syncTimeout)
  }

  const performSync = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      )

      if (Object.keys(cleanUpdates).length === 0) return

      const { error } = await supabase
        .from('profiles')
        .update(cleanUpdates)
        .eq('id', user.id)

      if (error) {
        console.error('Failed to sync state to cloud:', error.message || JSON.stringify(error))
      } else {
        console.log('Successfully synced state to Supabase!')
      }
    } catch (err) {
      console.error('Error in syncStateToCloud:', err)
    }
  }

  if (immediate) {
    performSync()
  } else {
    // Debounce by 1.5s for keystrokes
    syncTimeout = setTimeout(performSync, 1500)
  }
}
