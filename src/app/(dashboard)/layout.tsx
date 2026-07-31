'use client'

import { useState, useEffect } from 'react'
import { ResponsiveNav } from '@/components/layout/responsive-nav'
import { CommandPalette } from '@/components/layout/command-palette'
import { GlobalAICoach } from '@/components/layout/global-ai-coach'
import { RestTimer } from '@/components/workout/rest-timer'
import { SnowEffect } from '@/components/effects/snow-effect'
import { PageTransition } from '@/components/effects/page-transition'
import { ToastContainer } from '@/components/effects/toast'
import { ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useProfileStore } from '@/store/use-profile-store'
import { useWorkoutStore } from '@/store/use-workout-store'
import { useExerciseStore } from '@/store/useExerciseStore'
import { QuickAddFAB } from '@/components/layout/quick-add-fab'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { profile, setProfile } = useProfileStore()

  // Protect Routes & Hydrate Profile (only on mount, not on every nav)
  useEffect(() => {
    let mounted = true
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
      } else {
        if (!mounted) return
        setIsAuthenticated(true)
        // Only hydrate profile from cloud if store is empty (first load)
        if (!profile) {
          const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
          if (profileData && mounted) {
            setProfile({
              name: profileData.full_name || session.user.email,
              age: profileData.age || 20,
              gender: profileData.gender || 'male',
              height_cm: profileData.height_cm || 170,
              weight_kg: profileData.weight_kg || 65,
              body_fat: profileData.body_fat || null,
              experience: profileData.experience || 'beginner',
              goal: profileData.goal || 'recomposition',
              sessions_per_week: profileData.sessions_per_week || 3,
              metrics_history: profileData.metrics_history || [],
              role: profileData.role || 'user'
            })

            // Hydrate all state
            if (profileData.exercise_state) {
              useExerciseStore.setState({
                favoriteExerciseIds: profileData.exercise_state.favoriteExerciseIds || [],
                recentlyViewedIds: profileData.exercise_state.recentlyViewedIds || [],
                customExercises: profileData.exercise_state.customExercises || []
              })
            }
            if (profileData.workout_history) {
              useWorkoutStore.setState({ workoutHistory: profileData.workout_history })
            }
            if (profileData.personal_records) {
              useWorkoutStore.setState({ personalRecords: profileData.personal_records })
            }
            if (profileData.active_workout) {
              useWorkoutStore.setState({ activeWorkout: profileData.active_workout })
            }
          }
        }
      }
    }
    checkSession()
    return () => { mounted = false }
  }, [router])

  // Scroll to top listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Prevent flash of unauthenticated content
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030308] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-transparent text-slate-100 relative overflow-x-hidden">
      {/* Interactive Glowing Snow Effect */}
      <SnowEffect />

      <ResponsiveNav />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 p-3 lg:p-8 pb-32 md:pb-8 w-full relative z-20 overflow-x-hidden">
        <PageTransition>
          {children}
        </PageTransition>
      </main>

      {pathname !== '/workout' && <RestTimer />}

      <CommandPalette />
      <GlobalAICoach />
      <QuickAddFAB />

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-40 p-3.5 rounded-2xl aura-glass border-amber-400/50 text-amber-400 shadow-2xl hover:bg-amber-400/20 transition-all touch-target"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
