'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Mail, User, ArrowRight, Sparkles, ShieldCheck, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    if (!fullName.trim() || !email.trim()) return

    setIsLoading(true)

    const cleanEmail = email.toLowerCase().trim()
    const cleanName = fullName.trim()

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          full_name: cleanName
        }
      }
    })

    if (error) {
      if (error.message.includes('rate limit')) {
        setErrorMessage('Bạn đã thử quá nhiều lần. Vui lòng đợi một lát rồi thử lại.')
      } else {
        setErrorMessage(error.message === 'User already registered' ? 'Tài khoản đã tồn tại!' : error.message)
      }
      setIsLoading(false)
      return
    }

    if (data.user && !data.session) {
      setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra hộp thư email của bạn để xác nhận tài khoản.')
      setIsLoading(false)
      return
    }

    // Redirect to onboarding if they bypass email verification
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

          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs font-mono">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-xs font-mono">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

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
              disabled={isLoading}
              className="w-full py-4.5 btn-aura-gold text-black font-display font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all mt-6 shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  ĐANG ĐĂNG KÝ...
                </>
              ) : (
                <>
                  ĐĂNG KÝ TÀI KHOẢN
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs font-mono text-slate-400">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-amber-400 font-bold hover:underline">
                Đăng nhập
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
