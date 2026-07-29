'use client'

import { useMemo } from 'react'
import { useWorkoutStore } from '@/store/use-workout-store'
import { motion } from 'framer-motion'
import { Trophy, Dumbbell } from 'lucide-react'

export default function RecordsPage() {
  const { personalRecords } = useWorkoutStore()

  const sorted = useMemo(() =>
    Object.entries(personalRecords)
      .map(([name, pr]) => ({ name, ...pr }))
      .sort((a, b) => b.oneRM - a.oneRM),
    [personalRecords]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
            PERSONAL RECORDS
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            KỶ LỤC <span className="gold-gradient-text">CÁ NHÂN</span>
          </h1>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-slate-400">Tự động cập nhật khi hoàn thành set mới</p>
          <p className="text-lg font-black text-amber-400">{sorted.length} kỷ lục</p>
        </div>
      </div>

      <div className="glow-divider" />

      {sorted.length === 0 ? (
        <div className="aura-glass rounded-3xl p-12 text-center">
          <Dumbbell className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-300 mb-2">Chưa có kỷ lục nào</h3>
          <p className="text-slate-400 font-mono text-sm">Hoàn thành một set với tạ và reps để AURA tự động ghi nhận PR!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sorted.map((pr, idx) => {
            const medal =
              idx === 0 ? { color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-400/50', trophy: 'text-amber-400' } :
              idx === 1 ? { color: 'text-slate-300', bg: 'bg-slate-600/15 border-slate-400/50', trophy: 'text-slate-300' } :
              idx === 2 ? { color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-400/50', trophy: 'text-orange-400' } :
              { color: 'text-slate-600', bg: '', trophy: '' }

            const dateStr = pr.date ? new Date(pr.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

            return (
              <motion.div
                key={pr.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`aura-glass rounded-2xl p-5 flex items-center gap-5 hover:border-amber-400/40 transition-all ${idx < 3 ? medal.bg : ''}`}
              >
                {/* Rank */}
                <span className={`text-2xl font-black font-mono w-10 text-center shrink-0 ${medal.color}`}>
                  #{idx + 1}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate text-base">{pr.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs font-mono text-slate-400">{dateStr}</p>
                    <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 bg-slate-900/60 rounded-full border border-slate-800">
                      {pr.weight}kg × {pr.reps} reps
                    </span>
                  </div>
                </div>

                {/* 1RM Score */}
                <div className="text-right shrink-0">
                  <p className="text-2xl font-extrabold text-amber-400">
                    {pr.oneRM}
                    <span className="text-xs text-slate-400 font-normal ml-1">kg</span>
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">1RM Est.</p>
                </div>

                {/* Trophy icon for top 3 */}
                {idx < 3 && (
                  <Trophy className={`w-5 h-5 shrink-0 ${medal.trophy}`} />
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Info note */}
      {sorted.length > 0 && (
        <div className="text-center text-xs font-mono text-slate-500 pt-4">
          1RM ước tính theo công thức Epley: W × (1 + reps/30)
        </div>
      )}
    </motion.div>
  )
}
