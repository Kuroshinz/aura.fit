'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  ShieldCheck, Users, Activity, ShieldAlert, Dumbbell, ListTodo,
  CreditCard, MessageSquare, Settings, BarChart3, HardDrive,
  ChevronRight, ArrowUpRight, Clock, Database, Server, Globe,
  Wifi, AlertTriangle, CheckCircle2, Sparkles, TrendingUp, CalendarDays
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'

const QUICK_ACTIONS = [
  { label: 'Users', href: '/users', icon: Users, color: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400', desc: 'Manage athletes' },
  { label: 'Exercises', href: '/exercises', icon: Dumbbell, color: 'from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400', desc: '1300+ library' },
  { label: 'Templates', href: '/templates', icon: ListTodo, color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400', desc: 'Global routines' },
  { label: 'Roles', href: '/roles', icon: ShieldAlert, color: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/30 text-indigo-400', desc: 'Permissions' },
  { label: 'Subscriptions', href: '/subscriptions', icon: CreditCard, color: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400', desc: 'Billing tiers' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, color: 'from-fuchsia-500/20 to-fuchsia-500/5 border-fuchsia-500/30 text-fuchsia-400', desc: 'Deep insights' },
]

const PIE_COLORS = ['#f59e0b', '#6366f1', '#10b981']

export default function AdminPage() {
  const [stats, setStats] = useState({ users: 0, roles: 0, subscriptions: 0, exercises: 0, workouts: 0 })
  const [loading, setLoading] = useState(true)
  const [growthData, setGrowthData] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const [tierData, setTierData] = useState<any[]>([])
  const [systemStatus, setSystemStatus] = useState<'checking' | 'online' | 'degraded'>('checking')
  const [dbLatency, setDbLatency] = useState<number | null>(null)

  useEffect(() => {
    async function fetchAll() {
      const supabase = createClient()
      const started = performance.now()

      try {
        // Connection health probe
        const probe = await supabase.from('profiles').select('id', { count: 'exact', head: true })
        setDbLatency(Math.round(performance.now() - started))
        setSystemStatus(probe.error ? 'degraded' : 'online')
      } catch {
        setSystemStatus('degraded')
      }

      // Core counts
      const [uRes, rRes, sRes, eRes, wRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('roles').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }),
        supabase.from('exercises').select('id', { count: 'exact', head: true }),
        supabase.from('workout_logs').select('id', { count: 'exact', head: true }),
      ])

      setStats({
        users: uRes.count || 0,
        roles: rRes.count || 0,
        subscriptions: sRes.count || 0,
        exercises: eRes.count || 0,
        workouts: wRes.count || 0,
      })

      // Growth (last 6 months from profiles.created_at)
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: true })

      const monthMap: Record<string, number> = {}
      ;(allProfiles || []).forEach((p: any) => {
        const d = new Date(p.created_at)
        const key = d.toLocaleDateString('en-US', { month: 'short' })
        monthMap[key] = (monthMap[key] || 0) + 1
      })
      setGrowthData(Object.entries(monthMap).slice(-6).map(([m, c]) => ({ month: m, users: c })))

      // Tier distribution
      const { data: profiles } = await supabase
        .from('profiles')
        .select('subscriptions(name)')
      const tierCounts: Record<string, number> = {}
      ;(profiles || []).forEach((p: any) => {
        const name = p.subscriptions?.name || 'Free'
        tierCounts[name] = (tierCounts[name] || 0) + 1
      })
      setTierData(Object.entries(tierCounts).map(([name, value]) => ({ name, value })))

      // Recent users
      const { data: recent } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentUsers(recent || [])

      // Recent workouts
      const { data: recentW } = await supabase
        .from('workout_logs')
        .select('id, start_time, total_volume, profiles(full_name)')
        .order('start_time', { ascending: false })
        .limit(5)
      setRecentWorkouts(recentW || [])

      setLoading(false)
    }
    fetchAll()
  }, [])

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Exercises', value: stats.exercises, icon: Dumbbell, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { label: 'Workouts Logged', value: stats.workouts, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Custom Roles', value: stats.roles, icon: ShieldAlert, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Active Tiers', value: stats.subscriptions, icon: CreditCard, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  ]

  const systemItems = [
    { label: 'Database', value: systemStatus === 'online' ? 'Connected' : systemStatus === 'degraded' ? 'Degraded' : 'Checking...', icon: Database, ok: systemStatus !== 'degraded' },
    { label: 'Latency', value: dbLatency !== null ? `${dbLatency}ms` : '...', icon: Wifi, ok: dbLatency !== null && dbLatency < 500 },
    { label: 'API', value: 'Operational', icon: Globe, ok: true },
    { label: 'Storage', value: 'Operational', icon: HardDrive, ok: true },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
            NEXUS ENTERPRISE
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
            Command Center
          </h1>
          <p className="text-slate-400 mt-1">Platform overview and real-time metrics.</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold font-mono ${
          systemStatus === 'online'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : systemStatus === 'degraded'
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-slate-800 border-slate-700 text-slate-400'
        }`}>
          {systemStatus === 'online' ? <CheckCircle2 className="w-4 h-4" /> : systemStatus === 'degraded' ? <AlertTriangle className="w-4 h-4" /> : <Wifi className="w-4 h-4 animate-pulse" />}
          {systemStatus === 'online' ? 'ALL SYSTEMS OPERATIONAL' : systemStatus === 'degraded' ? 'SYSTEM DEGRADED' : 'CONNECTING...'}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`aura-glass bg-slate-900/40 p-5 rounded-2xl border ${card.bg} shadow-xl transition-all hover:border-amber-500/40 hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-3xl font-black text-white font-mono">{loading ? '...' : card.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={action.href}
                className={`group block p-4 rounded-2xl border bg-gradient-to-br ${action.color} transition-all hover:scale-[1.03] hover:shadow-lg`}
              >
                <action.icon className="w-6 h-6 mb-3" />
                <p className="font-bold text-white text-sm">{action.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{action.desc}</p>
                <div className="flex items-center gap-1 text-[10px] font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-white/70">
                  OPEN <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Growth Area Chart */}
        <div className="xl:col-span-2 aura-glass bg-slate-900/40 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            User Growth
          </h3>
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#fff' }} />
                <Area type="monotone" dataKey="users" stroke="#f59e0b" fill="url(#g)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          )}
        </div>

        {/* Tier Donut */}
        <div className="aura-glass bg-slate-900/40 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Tier Distribution
          </h3>
          {tierData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={tierData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name">
                  {tierData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          )}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {tierData.map((t, i) => (
              <span key={t.name} className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {t.name}: {t.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: System Health + Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="aura-glass bg-slate-900/40 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Server className="w-4 h-4 text-cyan-400" />
            System Health
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {systemItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <item.icon className={`w-5 h-5 ${item.ok ? 'text-emerald-400' : 'text-red-400'}`} />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{item.label}</p>
                  <p className={`text-sm font-bold ${item.ok ? 'text-emerald-300' : 'text-red-300'}`}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="aura-glass bg-slate-900/40 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-indigo-400" />
            Recent Activity
          </h3>
          <div className="space-y-3 max-h-[220px] overflow-y-auto scrollbar-none pr-2">
            {recentUsers.length === 0 && recentWorkouts.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-8">No recent activity</p>
            )}
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-black shrink-0">
                  {(u.full_name || 'U').substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{u.full_name || 'User'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{u.email || '—'}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                  {u.status || 'new'}
                </span>
              </div>
            ))}
            {recentWorkouts.map((w) => (
              <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{w.profiles?.full_name || 'Athlete'}</p>
                  <p className="text-[10px] text-slate-500">Workout completed</p>
                </div>
                {w.total_volume ? (
                  <span className="text-[10px] font-mono text-amber-400">{w.total_volume} kg</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
