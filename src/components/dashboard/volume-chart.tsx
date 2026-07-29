'use client'

import { useState } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { Activity } from 'lucide-react'
import { useWorkoutStore } from '@/store/use-workout-store'

export function VolumeChart() {
  const { workoutHistory } = useWorkoutStore()
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('30d')

  const cutoff = range === '7d'
    ? new Date(Date.now() - 7 * 864e5)
    : range === '30d'
    ? new Date(Date.now() - 30 * 864e5)
    : new Date(0)

  // Chuyển đổi dữ liệu Volume thực tế từ các buổi tập
  const realVolumeData = workoutHistory
    .filter(w => new Date(w.start_time) >= cutoff)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .map((w) => {
      const dateObj = new Date(w.start_time)
      const dayLabel = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
      return {
        date: dayLabel,
        volume: w.total_volume,
      }
    })

  return (
    <div className="aura-glass rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h3 className="text-2xl font-display font-black text-white tracking-tight flex items-center gap-3">
            <Activity className="w-6 h-6 text-amber-400" />
            TỔNG VOLUME TẬP LUYỆN THỰC TẺI
          </h3>
          <p className="text-xs font-mono text-slate-400 mt-1">THEO DÕI KHỐI LƯỢNG TẠ (KG) QUA CÁC BUỔI TẬP THỰC TẺI</p>
        </div>
        <div className="flex gap-1">
          {(['7d', '30d', 'all'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                range === r
                  ? 'bg-amber-400 text-black'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {r === '7d' ? '7 ngày' : r === '30d' ? '30 ngày' : 'Tất cả'}
            </button>
          ))}
        </div>
      </div>

      {realVolumeData.length === 0 ? (
        <div className="py-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-2xl">
          Chưa có dữ liệu Volume thực tế. Hãy bắt đầu và hoàn thành buổi tập đầu tiên!
        </div>
      ) : (
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={realVolumeData}>
              <defs>
                <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} fontFamily="var(--font-mono)" tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} fontFamily="var(--font-mono)" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#070714',
                  borderColor: '#f59e0b',
                  borderRadius: '20px',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.9)',
                }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                name="Volume (kg)"
                stroke="#f59e0b"
                strokeWidth={3.5}
                fillOpacity={1}
                fill="url(#colorGold)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
