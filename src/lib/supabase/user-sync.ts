import { createClient } from './client'
import { get, set } from 'idb-keyval'

let syncTimeout: any = null
let isFlushing = false

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

const QUEUE_KEY = 'aura-sync-queue'

async function getQueue(): Promise<SyncUpdates> {
  if (typeof window === 'undefined') return {}
  return (await get(QUEUE_KEY)) || {}
}

async function saveQueue(updates: SyncUpdates) {
  if (typeof window === 'undefined') return
  await set(QUEUE_KEY, updates)
}

async function clearQueue() {
  if (typeof window === 'undefined') return
  await set(QUEUE_KEY, {})
}

export async function flushSyncQueue() {
  if (typeof window === 'undefined' || isFlushing || !navigator.onLine) return
  
  const queuedUpdates = await getQueue()
  const cleanUpdates = Object.fromEntries(
    Object.entries(queuedUpdates).filter(([_, v]) => v !== undefined)
  )

  if (Object.keys(cleanUpdates).length === 0) return

  isFlushing = true
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      isFlushing = false
      return
    }

    const queueItems = []
    
    // Convert object updates into granular sync_queue rows
    for (const [key, value] of Object.entries(cleanUpdates)) {
      queueItems.push({
        entity_name: 'profiles',
        entity_id: user.id,
        operation_type: 'UPDATE',
        payload: { [key]: value },
        version: 1, // Store locally tracked version
        source_platform: 'web',
        status: 'pending'
      })
    }

    if (queueItems.length > 0) {
      const { error } = await supabase.from('sync_queue').insert(queueItems)
      if (error) {
        console.error('Failed to flush sync queue to cloud:', error.message || JSON.stringify(error))
      } else {
        console.log('Successfully flushed sync queue to Supabase!')
        await clearQueue()
        window.dispatchEvent(new CustomEvent('aura-sync-success'))
      }
    } else {
      await clearQueue()
      window.dispatchEvent(new CustomEvent('aura-sync-success'))
    }
  } catch (err) {
    console.error('Error in flushSyncQueue:', err)
  } finally {
    isFlushing = false
  }
}

export async function syncStateToCloud(
  updates: SyncUpdates,
  immediate = false
) {
  // Merge new updates into the queue
  const currentQueue = await getQueue()
  const mergedQueue = { ...currentQueue, ...updates }
  await saveQueue(mergedQueue)

  // Notify UI that changes are queued locally
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aura-sync-queued'))
  }

  if (syncTimeout) {
    clearTimeout(syncTimeout)
  }

  const performSync = () => {
    if (typeof window !== 'undefined' && navigator.onLine) {
      flushSyncQueue()
    }
  }

  if (immediate) {
    performSync()
  } else {
    // Debounce by 1.5s for keystrokes
    syncTimeout = setTimeout(performSync, 1500)
  }
}

// Setup network listeners for offline recovery
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Network online. Flushing sync queue...')
    flushSyncQueue()
  })
}
