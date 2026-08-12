'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, Users, Activity, ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminPage() {
  const [stats, setStats] = useState({ users: 0, roles: 0, subscriptions: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()
      const [uRes, rRes, sRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('roles').select('id', { count: 'exact' }),
        supabase.from('subscriptions').select('id', { count: 'exact' })
      ])
      setStats({
        users: uRes.count || 0,
        roles: rRes.count || 0,
        subscriptions: sRes.count || 0
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-amber-500" />
          Command Center
        </h1>
        <p className="text-slate-400 mt-1">Platform overview and real-time metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="aura-glass bg-slate-900/40 p-6 rounded-2xl border border-amber-500/20 shadow-xl transition-all hover:border-amber-500/40">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20"><Users className="w-6 h-6 text-amber-500" /></div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
              <p className="text-3xl font-black text-white font-mono mt-1">{loading ? '...' : stats.users}</p>
            </div>
          </div>
        </div>
        <div className="aura-glass bg-slate-900/40 p-6 rounded-2xl border border-indigo-500/20 shadow-xl transition-all hover:border-indigo-500/40">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20"><ShieldAlert className="w-6 h-6 text-indigo-400" /></div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Custom Roles</p>
              <p className="text-3xl font-black text-white font-mono mt-1">{loading ? '...' : stats.roles}</p>
            </div>
          </div>
        </div>
        <div className="aura-glass bg-slate-900/40 p-6 rounded-2xl border border-emerald-500/20 shadow-xl transition-all hover:border-emerald-500/40">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><Activity className="w-6 h-6 text-emerald-400" /></div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Tiers</p>
              <p className="text-3xl font-black text-white font-mono mt-1">{loading ? '...' : stats.subscriptions}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
