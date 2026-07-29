'use client'

import { useState, useEffect } from 'react'
import { useProfileStore } from '@/store/use-profile-store'
import { ShieldCheck, Users, Dumbbell, Activity, Sparkles, ToggleLeft, ToggleRight, Crown, Key, Cpu, RefreshCw, Trash2, UserCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const MASTER_ADMIN_EMAIL = 'admin@aura.fit'

export default function AdminPage() {
  const { profile } = useProfileStore()
  const [accounts, setAccounts] = useState<any[]>([])
  const [featureFlags, setFeatureFlags] = useState({
    aiCoach: true,
    confettiEffects: true,
    restTimerAudio: true,
    excelExport: true,
    experimental3D: true,
  })

  // Load real registered accounts from Supabase database
  const refreshAccounts = async () => {
    if (typeof window !== 'undefined') {
      const supabase = createClient()
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true })
      if (data) {
        setAccounts(data)
      } else {
        console.error("Failed to fetch profiles:", error)
      }
    }
  }

  useEffect(() => {
    refreshAccounts()
  }, [])

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const supabase = createClient()
    await supabase.from('profiles').update({ role: newRole }).eq('id', id)
    refreshAccounts()
  }

  const handleDelete = async (id: string, email: string) => {
    if (email === MASTER_ADMIN_EMAIL) return
    if (confirm(`Are you sure you want to delete profile for ${email}?`)) {
      const supabase = createClient()
      await supabase.from('profiles').delete().eq('id', id)
      refreshAccounts()
    }
  }

  const toggleFlag = (flagKey: keyof typeof featureFlags) => {
    setFeatureFlags((prev) => ({ ...prev, [flagKey]: !prev[flagKey] }))
  }

  // Calculate real metrics from system data
  const totalUsers = accounts.length
  const totalVolumeAcrossNetwork = accounts.reduce((total, acc) => {
    const userVolume = (acc.workout_history || []).reduce((sum: number, w: any) => sum + (w.total_volume || 0), 0)
    return total + userVolume
  }, 0)

  return (
    <div className="space-y-10">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-400/40 pb-6">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2 mb-1">
            <Crown className="w-4 h-4 text-amber-400 fill-current" />
            SUPER ADMIN CONTROL PANEL
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            SYSTEM MANAGEMENT <span className="gold-gradient-text">AURA.FIT</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshAccounts}
            className="aura-glass px-4 py-2.5 rounded-2xl flex items-center gap-2 border-amber-400/50 text-amber-300 font-mono text-xs font-bold hover:bg-amber-400/10 transition-all"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>REFRESH DATA</span>
          </button>
          <div className="aura-glass px-4 py-2.5 rounded-2xl flex items-center gap-2 border-emerald-400/50 text-emerald-400 font-mono text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>LIVE DATA ACTIVE</span>
          </div>
        </div>
      </div>

      {/* System Metrics Real Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="aura-glass p-6 rounded-3xl border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">TOTAL MEMBERS</span>
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{totalUsers} <span className="text-xs text-emerald-400 font-normal">Accounts</span></p>
        </div>

        <div className="aura-glass p-6 rounded-3xl border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">NETWORK VOLUME</span>
            <Dumbbell className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{totalVolumeAcrossNetwork > 1000 ? `${(totalVolumeAcrossNetwork / 1000).toFixed(1)}k` : totalVolumeAcrossNetwork} <span className="text-xs text-slate-400 font-normal">kg</span></p>
        </div>

        <div className="aura-glass p-6 rounded-3xl border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">EXERCISE LIBRARY</span>
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-extrabold text-cyan-300 font-mono">50+ <span className="text-xs text-slate-400 font-normal">Exercises</span></p>
        </div>

        <div className="aura-glass p-6 rounded-3xl border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">PROXY SERVER</span>
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-emerald-400 font-mono">ONLINE <span className="text-xs text-slate-400 font-normal">99.9%</span></p>
        </div>
      </div>

      {/* User Management Section */}
      <div className="aura-glass rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            REGISTERED ACCOUNTS &amp; ROLE MANAGEMENT
          </h2>
          <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full uppercase">
            LIVE SYSTEM DATABASE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-xs font-mono font-bold text-slate-400 uppercase">
                <th className="pb-3 px-3">MEMBER NAME</th>
                <th className="pb-3 px-3">EMAIL</th>
                <th className="pb-3 px-3 text-center">ROLE</th>
                <th className="pb-3 px-3 text-center">WORKOUT SESSIONS</th>
                <th className="pb-3 px-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {accounts.map((user) => (
                <tr key={user.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-4 px-3 font-bold text-white flex items-center gap-2">
                    {user.full_name || user.email?.split('@')[0] || 'Unknown'}
                    {user.role === 'admin' && (
                      <span className="px-2 py-0.5 bg-amber-400 text-black text-[9px] font-mono font-black rounded-md flex items-center gap-1">
                        <Crown className="w-3 h-3 fill-current" /> ADMIN
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-3 font-mono text-slate-300 text-xs">{user.email || '—'}</td>
                  <td className="py-4 px-3 text-center font-mono">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.role === 'admin'
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                          : 'bg-slate-900 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {(user.role || 'user').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-center font-mono text-xs text-slate-300">
                    {(user.workout_history || []).length} sessions
                  </td>
                  <td className="py-4 px-3 text-center flex items-center justify-center gap-2">
                    <button
                      onClick={() => toggleRole(user.id, user.role)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-amber-500/20 text-amber-300 border border-slate-700 hover:border-amber-400 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                    >
                      TOGGLE ROLE
                    </button>
                    {user.email !== MASTER_ADMIN_EMAIL && (
                      <button
                        onClick={() => handleDelete(user.id, user.email)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-400 border border-red-500/30 hover:border-red-400 rounded-xl transition-all cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Feature Flags Control */}
      <div className="aura-glass rounded-3xl p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          SYSTEM FEATURE FLAGS CONTROL
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'aiCoach', title: 'AI Coach Module', desc: 'Progressive overload AI recommendations' },
            { key: 'confettiEffects', title: 'Confetti Celebration Effects', desc: 'Trigger particle effects on set & PR completion' },
            { key: 'restTimerAudio', title: 'Rest Timer Web Audio Beep', desc: 'Play countdown beep when rest timer finishes' },
            { key: 'excelExport', title: 'Excel .XLSX Data Export', desc: 'Allow downloading routines & logs to Excel' },
            { key: 'experimental3D', title: 'Antigravity 3D Particle Snow', desc: '3D glowing background energy particles' },
          ].map((f) => {
            const isEnabled = featureFlags[f.key as keyof typeof featureFlags]
            return (
              <div
                key={f.key}
                onClick={() => toggleFlag(f.key as keyof typeof featureFlags)}
                className={`p-5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  isEnabled ? 'bg-amber-500/10 border-amber-400/50 shadow-lg' : 'bg-[#070714] border-slate-800 opacity-60'
                }`}
              >
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">{f.title}</h4>
                  <p className="text-xs font-mono text-slate-400">{f.desc}</p>
                </div>
                {isEnabled ? (
                  <ToggleRight className="w-8 h-8 text-amber-400 shrink-0" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600 shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
