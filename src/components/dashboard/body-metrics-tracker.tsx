'use client'

import { useState, useEffect } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { Scale, Plus, TrendingDown, TrendingUp } from 'lucide-react'
import { useProfileStore } from '@/store/use-profile-store'

interface MetricLog {
  date: string
  weight: number
  bodyFat: number
}

export function BodyMetricsTracker() {
  const { profile, updateProfile } = useProfileStore()
  const [logs, setLogs] = useState<MetricLog[]>([])
  const [newWeight, setNewWeight] = useState('')
  const [newFat, setNewFat] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  // Đồng bộ chỉ số thực từ profile cá nhân vừa đăng ký/tạo mới
  useEffect(() => {
    if (profile) {
      if (profile.metrics_history && profile.metrics_history.length > 0) {
        setLogs(profile.metrics_history)
      } else {
        const todayLog: MetricLog = {
          date: 'Hôm nay',
          weight: profile.weight_kg,
          bodyFat: profile.body_fat || 15.0,
        }
        setLogs([todayLog])
      }
    } else {
      setLogs([])
    }
  }, [profile])

  const handleAddMetric = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWeight) return

    const weightNum = parseFloat(newWeight)
    const fatNum = newFat ? parseFloat(newFat) : (logs[logs.length - 1]?.bodyFat || 15.0)

    const dateStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    const newLog: MetricLog = {
      date: dateStr,
      weight: weightNum,
      bodyFat: fatNum,
    }

    const newLogs = [...logs, newLog]
    setLogs(newLogs)
    
    // Push the entire history array and update the current profile weight/fat so it displays correctly elsewhere
    updateProfile({
      weight_kg: weightNum,
      body_fat: fatNum,
      metrics_history: newLogs
    })

    setNewWeight('')
    setNewFat('')
    setShowAddForm(false)
    alert('Đã cập nhật chỉ số cân nặng mới thành công!')
  }

  const latest = logs[logs.length - 1] || { weight: profile?.weight_kg || 0, bodyFat: profile?.body_fat || 0 }
  const first = logs[0] || latest
  const weightDiff = (latest.weight - first.weight).toFixed(1)
  const isWeightDown = parseFloat(weightDiff) <= 0

  return (
    <div className="aura-glass rounded-3xl p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
        <div>
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            ⚖️ THEO DÕI CÂN NẶNG &amp; % MỠ CƠ THỂ
          </h3>
          <p className="text-xs font-mono text-slate-300 mt-1">Ghi nhận tiến trình Giảm mỡ (Cutting) / Tăng cơ (Bulking)</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 btn-aura-gold text-black font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          NHẬP CÂN NẶNG HÔM NAY
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddMetric} className="p-4 rounded-2xl bg-[#070714] border border-slate-700 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 uppercase block mb-1">CÂN NẶNG (KG)</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="VD: 72.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-white font-mono text-base focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 uppercase block mb-1">TỶ LỆ MỠ % (OPTIONAL)</label>
              <input
                type="number"
                step="0.1"
                placeholder="VD: 16.5"
                value={newFat}
                onChange={(e) => setNewFat(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-white font-mono text-base focus:outline-none"
              />
            </div>
          </div>
          <button type="submit" className="px-6 py-2.5 bg-emerald-500 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider">
            LƯU CHỈ SỐ
          </button>
        </form>
      )}

      {/* Stats Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#070714] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block mb-0.5">CÂN NẶNG HIỆN TẠI</span>
            <p className="text-2xl font-extrabold text-white font-mono">{latest.weight || '--'} kg</p>
          </div>
          <Scale className="w-7 h-7 text-amber-400" />
        </div>

        <div className="p-4 rounded-2xl bg-[#070714] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block mb-0.5">TỶ LỆ MỠ (BODY FAT)</span>
            <p className="text-2xl font-extrabold text-cyan-300 font-mono">{latest.bodyFat ? `${latest.bodyFat}%` : '---'}</p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg">FIT</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#070714] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block mb-0.5">THAY ĐỔI THEO DÕI</span>
            <p className={`text-2xl font-extrabold font-mono ${isWeightDown ? 'text-emerald-400' : 'text-amber-400'}`}>
              {weightDiff > '0' ? `+${weightDiff}` : weightDiff} kg
            </p>
          </div>
          {isWeightDown ? (
            <TrendingDown className="w-7 h-7 text-emerald-400" />
          ) : (
            <TrendingUp className="w-7 h-7 text-amber-400" />
          )}
        </div>
      </div>

      {/* Recharts Body Metrics Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={logs}>
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} fontFamily="var(--font-mono)" tickLine={false} />
            <YAxis yAxisId="left" stroke="#fbbf24" fontSize={11} fontFamily="var(--font-mono)" tickLine={false} unit="kg" domain={['dataMin - 2', 'dataMax + 2']} />
            <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" fontSize={11} fontFamily="var(--font-mono)" tickLine={false} unit="%" domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#070714',
                borderColor: '#fbbf24',
                borderRadius: '16px',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
              }}
            />
            <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }} />
            <Line yAxisId="left" type="monotone" dataKey="weight" name="Cân nặng (kg)" stroke="#fbbf24" strokeWidth={3} dot={{ r: 5, fill: '#fbbf24' }} />
            <Line yAxisId="right" type="monotone" dataKey="bodyFat" name="Body Fat (%)" stroke="#38bdf8" strokeWidth={3} strokeDasharray="4 4" dot={{ r: 4, fill: '#38bdf8' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
