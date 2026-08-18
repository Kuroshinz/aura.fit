'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, ShieldAlert, LogIn, LogOut, XCircle, RefreshCw, Trash2, Clock, Globe, Monitor } from 'lucide-react'
import { motion } from 'framer-motion'

type AuditEntry = {
  id: string
  email: string
  action: string
  ip_address: string | null
  user_agent: string | null
  status: string
  created_at: string
}

const ACTION_META: Record<string, { label: string; icon: any; color: string }> = {
  login_success: { label: 'Login Success', icon: LogIn, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  login_failed: { label: 'Login Failed', icon: XCircle, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  unauthorized_attempt: { label: 'Unauthorized', icon: ShieldAlert, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  logout: { label: 'Logout', icon: LogOut, color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
}

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLogs = async () => {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      setError(error.message)
    } else {
      setLogs(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchLogs() }, [])

  const clearLogs = async () => {
    if (!confirm('Xóa toàn bộ lịch sử bảo mật?')) return
    const supabase = createClient()
    const { error } = await supabase.from('admin_audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (!error) fetchLogs()
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const getDevice = (ua: string | null) => {
    if (!ua) return 'Unknown device'
    if (/mobile|android|iphone/i.test(ua)) return 'Mobile device'
    if (/mac/i.test(ua)) return 'Mac'
    if (/windows/i.test(ua)) return 'Windows'
    return 'Desktop'
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
            NEXUS SECURITY
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            Security Logs
          </h1>
          <p className="text-slate-400 mt-1">Toàn bộ phiên đăng nhập Admin — thời gian, IP, thiết bị.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> REFRESH
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> CLEAR
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-mono">
          ❌ {error}
        </div>
      )}

      <div className="aura-glass bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Chưa có hoạt động đăng nhập nào được ghi nhận.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {logs.map((log) => {
              const meta = ACTION_META[log.action] || { label: log.action, icon: ShieldAlert, color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' }
              const Icon = meta.icon
              return (
                <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{log.email}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        log.status === 'success' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' : 'text-red-400 border-red-500/30 bg-red-500/5'
                      }`}>
                        {log.status || 'unknown'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      {meta.label}
                      {log.ip_address && <span className="ml-2 inline-flex items-center gap-1"><Globe className="w-3 h-3" /> {log.ip_address}</span>}
                      <span className="ml-2 inline-flex items-center gap-1"><Monitor className="w-3 h-3" /> {getDevice(log.user_agent)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatTime(log.created_at)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
