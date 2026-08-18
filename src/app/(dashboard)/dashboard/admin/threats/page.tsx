'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShieldAlert, AlertTriangle, Ban, Flame, Eye, RefreshCw, UserX, CheckCircle2, Fingerprint } from 'lucide-react'
import { motion } from 'framer-motion'
import { MAX_ATTEMPTS_PER_IP } from '@/lib/supabase/security'

type AttemptEntry = {
  id: string
  ip_address: string
  action: string
  email: string | null
  attempts: number
  blocked_until: string | null
  created_at: string
}

type BannedEntry = {
  id: string
  email: string | null
  ip_address: string | null
  reason: string | null
  banned_by: string | null
  banned_at: string
}

export default function ThreatMonitorPage() {
  const [attempts, setAttempts] = useState<AttemptEntry[]>([])
  const [banned, setBanned] = useState<BannedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    const supabase = createClient()

    const [attemptsRes, bannedRes] = await Promise.all([
      supabase.from('auth_attempts').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('banned_users').select('*').order('banned_at', { ascending: false }).limit(50),
    ])

    if (attemptsRes.error) setError(attemptsRes.error.message)
    else setAttempts(attemptsRes.data || [])

    if (bannedRes.error) setError(prev => prev || bannedRes.error?.message || '')
    else setBanned(bannedRes.data || [])

    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const unban = async (id: string) => {
    const supabase = createClient()
    const entry = banned.find(b => b.id === id)
    if (!entry) return

    // Unban via profile email lookup (rpc needs user id)
    if (entry.email) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('email', entry.email).single()
      if (profile) {
        await supabase.rpc('unban_user', { target_user_id: profile.id })
      }
    }
    await supabase.from('banned_users').delete().eq('id', id)
    fetchData()
  }

  const formatTime = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  const highRiskCount = attempts.filter(a => a.attempts >= MAX_ATTEMPTS_PER_IP - 1 || a.blocked_until).length

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest block mb-1">
            NEXUS SECURITY
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Fingerprint className="w-8 h-8 text-red-400" />
            Threat Monitor
          </h1>
          <p className="text-slate-400 mt-1">Phát hiện Spam đăng nhập/đăng kí, khóa IP, tự động ban user.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-bold text-red-300">{highRiskCount} high risk</span>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> REFRESH
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-mono">
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 flex justify-center"><RefreshCw className="w-6 h-6 text-amber-400 animate-spin" /></div>
      ) : (
        <>
          {/* ─── Banned Users ─── */}
          <div className="aura-glass bg-slate-900/40 rounded-2xl border border-red-500/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
              <Ban className="w-4 h-4 text-red-400" />
              <h2 className="font-bold text-white">Banned Users ({banned.length})</h2>
            </div>
            {banned.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">Không có user nào bị ban.</div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {banned.map((b) => (
                  <div key={b.id} className="flex items-center gap-4 px-6 py-3.5">
                    <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20"><UserX className="w-4 h-4 text-red-400" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{b.email || b.ip_address || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 font-mono">{(b.reason || 'No reason')} • by {b.banned_by || 'system'} • {formatTime(b.banned_at)}</p>
                    </div>
                    <button
                      onClick={() => unban(b.id)}
                      className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/30 transition-colors"
                    >
                      UNBAN
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── Suspicious Attempts ─── */}
          <div className="aura-glass bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <h2 className="font-bold text-white">Login/Register Attempts by IP ({attempts.length})</h2>
            </div>
            {attempts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">Chưa có dữ liệu attempts.</div>
            ) : (
              <div className="divide-y divide-slate-800/60 max-h-[400px] overflow-y-auto">
                {attempts.map((a) => {
                  const risk = a.attempts >= MAX_ATTEMPTS_PER_IP || a.blocked_until ? 'HIGH' : a.attempts >= 2 ? 'MEDIUM' : 'LOW'
                  const riskColor = risk === 'HIGH' ? 'text-red-400 bg-red-500/10 border-red-500/30' : risk === 'MEDIUM' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  return (
                    <div key={a.id} className="flex items-center gap-4 px-6 py-3.5">
                      <div className="p-2 bg-slate-800 rounded-lg"><Flame className={`w-4 h-4 ${risk === 'HIGH' ? 'text-red-400' : risk === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm font-mono truncate">{a.ip_address}</p>
                        <p className="text-xs text-slate-400">{a.action} {a.email ? `• ${a.email}` : ''} • {formatTime(a.created_at)}</p>
                      </div>
                      {a.blocked_until && (
                        <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/30">
                          LOCKED
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${riskColor}`}>
                        {risk} • {a.attempts}/{MAX_ATTEMPTS_PER_IP}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}
