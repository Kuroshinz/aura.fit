import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { syncStateToCloud } from '@/lib/supabase/user-sync'

export interface UserProfile {
  name: string
  age: number
  gender: 'male' | 'female'
  height_cm: number
  weight_kg: number
  body_fat: number | null
  experience: 'beginner' | '6m-1y' | '1y-3y' | '3y+'
  goal: 'recomposition' | 'bulking' | 'cutting' | 'strength' | 'health'
  sessions_per_week: number
  role?: 'admin' | 'user'
  telegram_chat_id?: string
}

interface ProfileState {
  profile: UserProfile | null
  isOnboardingComplete: boolean
  setProfile: (profile: UserProfile) => void
  updateProfile: (partial: Partial<UserProfile>) => void
  resetProfile: () => void
  logout: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      isOnboardingComplete: false,

      setProfile: (profile) => {
        set({ profile, isOnboardingComplete: true })
        syncStateToCloud({ age: profile.age, gender: profile.gender, height_cm: profile.height_cm, weight_kg: profile.weight_kg, body_fat: profile.body_fat, experience: profile.experience, goal: profile.goal, sessions_per_week: profile.sessions_per_week })
      },

      updateProfile: (partial) => {
        const { profile } = get()
        if (!profile) return
        const updated = { ...profile, ...partial }
        set({ profile: updated })
        
        // Sync to account DB via shared utility
        if (typeof window !== 'undefined') {
          const currentEmail = getCurrentSessionEmail()
          if (currentEmail) {
            saveAccountData(currentEmail, { profile: updated })
          }
        }
      },

      resetProfile: () => {
        set({ profile: null, isOnboardingComplete: false })

        // Clear from account DB
        if (typeof window !== 'undefined') {
          const currentEmail = getCurrentSessionEmail()
          if (currentEmail) {
            saveAccountData(currentEmail, { profile: null })
          }
        }
      },

      logout: () => {
        // Save final state to account DB before clearing
        const { profile } = get()
        if (typeof window !== 'undefined') {
          const currentEmail = getCurrentSessionEmail()
          if (currentEmail && profile) {
            saveAccountData(currentEmail, { profile })
          }
        }

        set({ profile: null, isOnboardingComplete: false })

        if (typeof window !== 'undefined') {
          localStorage.removeItem('gym-user-profile-storage')
          localStorage.removeItem('gym-active-workout-storage')
          localStorage.removeItem('aura_custom_routine')
          localStorage.removeItem('aura_register_temp_name')
        }
      },
    }),
    {
      name: 'gym-user-profile-storage',
    }
  )
)

export const experienceLabels: Record<string, string> = {
  'beginner': 'Mới bắt đầu',
  '6m-1y': '6 tháng – 1 năm',
  '1y-3y': '1 – 3 năm',
  '3y+': 'Trên 3 năm',
}

export const goalLabels: Record<string, string> = {
  'recomposition': 'Tăng cơ Giảm mỡ (Recomp)',
  'bulking': 'Tăng cơ (Bulking)',
  'cutting': 'Giảm mỡ (Cutting)',
  'strength': 'Tăng sức mạnh',
  'health': 'Duy trì sức khỏe',
}
