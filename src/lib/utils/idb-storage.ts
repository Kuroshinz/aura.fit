import { get, set, del } from 'idb-keyval'
import { StateStorage } from 'zustand/middleware'

export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // Attempt to migrate from localStorage on first access
    if (typeof window !== 'undefined') {
      try {
        const migratedKey = `${name}-migrated`
        const hasMigrated = localStorage.getItem(migratedKey)
        
        if (!hasMigrated) {
          const legacyData = localStorage.getItem(name)
          if (legacyData) {
            await set(name, legacyData)
            localStorage.setItem(migratedKey, 'true')
            console.log(`Migrated ${name} from localStorage to IndexedDB`)
          }
        }
      } catch (e) {
        console.warn(`Migration failed for ${name}:`, e)
      }
    }

    const value = await get(name)
    return value || null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name)
  }
}
