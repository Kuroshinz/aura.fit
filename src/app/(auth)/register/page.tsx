'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useProfileStore } from '@/store/use-profile-store'
import { useWorkoutStore } from '@/store/use-workout-store'
import { saveAccountData, setCurrentSessionEmail, MASTER_ADMIN_EMAIL } from '@/lib/utils/account-db'
import { Lock, Mail, User, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const { resetProfile } = useProfileStore()

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim()) return

    const cleanEmail = email.toLowerCase().trim()
    const cleanName = fullName.trim()

    // Strict Role Assignment: Only admin@aura.fit gets 'admin', all other accounts get 'user'
    const role: 'admin' | 'user' = cleanEmail === MASTER_ADMIN_EMAIL ? 'admin' : 'user'

    // Set active session for new user
    setCurrentSessionEmail(cleanEmail)

    // Initialize clean account data in DB
    saveAccountData(cleanEmail, {
      email: cleanEmail,
      fullName: cleanName,
      role,
      profile: null,
      workoutHistory: [],
      customRoutine: null,
      activeWorkout: null,
    })

    // Reset stores for fresh account onboarding
    resetProfile()
    useWorkoutStore.setState({ workoutHistory: [], activeWorkout: null })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aura_custom_routine')
      localStorage.setItem('aura_register_temp_name', cleanName)
    }

    // Redirect to onboarding
    router.push('/onboarding')
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
              CREATE<span className="text-slate-400 font-light"> ACCOUNT</span>
            </h1>
            <p className="text-slate-400 text-xs font-mono tracking-[0.2em] mt-2 uppercase">AURA.FIT SPATIAL SYSTEM</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 block">FULL NAME</label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#070714] border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 block">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#070714] border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4.5 btn-aura-gold text-black font-display font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all mt-6 shadow-2xl"
            >
              CREATE ACCOUNT &amp; CONTINUE
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs font-mono text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-amber-400 font-bold hover:underline">
                Log in
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>SECURE REGISTRATION</span>
          </div>
        </div>
      </div>
    </div>
  )
}
