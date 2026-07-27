'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useProfileStore } from '@/store/use-profile-store'
import { useWorkoutStore } from '@/store/use-workout-store'
import { useExerciseStore } from '@/store/useExerciseStore'
import { Lock, Mail, ArrowRight, Sparkles, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setProfile } = useProfileStore()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ thông tin.')
      return
    }

    setIsLoading(true)

    const cleanEmail = email.toLowerCase().trim()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    })

    if (error) {
      if (error.message === 'Email not confirmed') {
        setErrorMessage('Tài khoản chưa được xác thực. Vui lòng kiểm tra email của bạn.')
      } else if (error.message.includes('rate limit')) {
        setErrorMessage('Bạn đã thử quá nhiều lần. Vui lòng đợi một lát rồi thử lại.')
      } else {
        setErrorMessage(error.message === 'Invalid login credentials' ? 'Tài khoản hoặc mật khẩu không chính xác.' : error.message)
      }
      setIsLoading(false)
      return
    }

    // Fetch profile
    if (data.user) {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (profileData) {
        setProfile({
          name: profileData.full_name || cleanEmail,
          age: profileData.age || 20,
          gender: profileData.gender || 'male',
          height_cm: profileData.height_cm || 170,
          weight_kg: profileData.weight_kg || 65,
          body_fat: profileData.body_fat || null,
          experience: profileData.experience || 'beginner',
          goal: profileData.goal || 'recomposition',
          sessions_per_week: profileData.sessions_per_week || 3,
          role: 'user'
        })
        if (profileData.exercise_state) {
          useExerciseStore.setState({
            favoriteExerciseIds: profileData.exercise_state.favoriteExerciseIds || [],
            recentlyViewedIds: profileData.exercise_state.recentlyViewedIds || [],
            customExercises: profileData.exercise_state.customExercises || []
          })
        }
        useWorkoutStore.setState({
          workoutHistory: profileData.workout_history || [],
          personalRecords: profileData.personal_records || {},
          activeWorkout: profileData.active_workout || null,
        })
      }
      
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#030308] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient Spatial Glows */}
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-amber-500/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-[600px] h-[600px] bg-indigo-500/10 blur-[180px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="p-8 md:p-10 rounded-3xl shadow-[0_0_50px_rgba(251,191,36,0.1)] border border-amber-500/20 bg-slate-900/40 backdrop-blur-3xl relative overflow-hidden">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-4 bg-gradient-to-tr from-amber-400 via-indigo-500 to-emerald-400 rounded-2xl mb-4 shadow-2xl shadow-amber-500/20 animate-float">
              <Sparkles className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-3xl font-display font-black tracking-tight gold-gradient-text">
              AURA<span className="text-slate-400 font-light">.FIT</span>
            </h1>
            <p className="text-slate-400 text-xs font-mono tracking-[0.2em] mt-2 uppercase font-extrabold">
              SPATIAL ATHLETICS SYSTEM
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs font-mono">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 block">ACCOUNT EMAIL</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-[#070714] border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 block">PASSWORD</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#070714] border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4.5 btn-aura-gold text-black font-display font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all mt-6 shadow-2xl cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  ĐANG ĐĂNG NHẬP...
                </>
              ) : (
                <>
                  ĐĂNG NHẬP
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-xs font-mono text-slate-400">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-amber-400 font-bold hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>AUTHENTICATED MULTI-USER DB</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
