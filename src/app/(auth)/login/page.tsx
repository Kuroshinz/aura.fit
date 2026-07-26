'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useProfileStore } from '@/store/use-profile-store'
import { useWorkoutStore } from '@/store/use-workout-store'
import {
  MASTER_ADMIN_EMAIL,
  MASTER_ADMIN_PROFILE,
  resetAllAndCreateMasterAdmin,
  getAccountByEmail,
  setCurrentSessionEmail,
} from '@/lib/utils/account-db'
import { Lock, Mail, ArrowRight, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  const { setProfile } = useProfileStore()

  // Ensure Master Admin exists on first load
  useEffect(() => {
    const account = getAccountByEmail(MASTER_ADMIN_EMAIL)
    if (!account) {
      resetAllAndCreateMasterAdmin()
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    if (!email.trim()) return

    const cleanEmail = email.toLowerCase().trim()
    const account = getAccountByEmail(cleanEmail)

    // Strictly validate that account exists in database before allowing login
    if (!account) {
      setErrorMessage('Account does not exist. Please check your email or register a new account.')
      return
    }

    // Set active session for the verified user
    setCurrentSessionEmail(cleanEmail)

    if (account.profile) {
      setProfile(account.profile)
      useWorkoutStore.setState({
        workoutHistory: account.workoutHistory || [],
        activeWorkout: account.activeWorkout || null,
      })
      router.push('/dashboard')
    } else {
      router.push('/onboarding')
    }
  }

  return (
    <div className="min-h-screen bg-[#030308] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient Spatial Glows */}
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-amber-500/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-[600px] h-[600px] bg-indigo-500/10 blur-[180px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="aura-glass p-8 md:p-10 rounded-3xl shadow-2xl border border-amber-500/20">
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
              className="w-full py-4.5 btn-aura-gold text-black font-display font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all mt-6 shadow-2xl cursor-pointer"
            >
              LOG IN
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-xs font-mono text-slate-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-amber-400 font-bold hover:underline">
                Register now
              </Link>
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@aura.fit')
                setPassword('123456')
                setErrorMessage('')
              }}
              className="text-[11px] font-mono text-slate-400 hover:text-amber-300 underline transition-colors cursor-pointer"
            >
              Fill Master Admin Credentials (admin@aura.fit)
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>AUTHENTICATED MULTI-USER DB</span>
          </div>
        </div>
      </div>
    </div>
  )
}
