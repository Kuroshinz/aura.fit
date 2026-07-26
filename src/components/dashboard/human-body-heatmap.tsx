'use client'

import { useWorkoutStore } from '@/store/use-workout-store'

interface MuscleIntensity {
  chest: number
  back: number
  shoulders: number
  biceps: number
  triceps: number
  quads: number
  hamstrings: number
  calves: number
  abs: number
}

export function HumanBodyHeatmap() {
  const { workoutHistory } = useWorkoutStore()
  const [view, setView] = useState<'front' | 'back'>('front')

  // Tính toán Volume thực từ tất cả các buổi tập đã hoàn thành trong lịch sử
  const intensities: MuscleIntensity = workoutHistory.reduce(
    (acc, w) => {
      w.exercises.forEach((ex) => {
        const completedSets = ex.sets.filter((s) => s.is_completed)
        const exerciseVolume = completedSets.reduce((sum, s) => sum + s.weight_kg * s.reps, 0)

        const m = ex.muscle_group.toLowerCase()
        if (m.includes('chest') || m.includes('ngực')) acc.chest += exerciseVolume
        else if (m.includes('back') || m.includes('lưng') || m.includes('xô')) acc.back += exerciseVolume
        else if (m.includes('shoulder') || m.includes('vai')) acc.shoulders += exerciseVolume
        else if (m.includes('bicep') || m.includes('tay trước')) acc.biceps += exerciseVolume
        else if (m.includes('tricep') || m.includes('tay sau')) acc.triceps += exerciseVolume
        else if (m.includes('leg') || m.includes('đùi') || m.includes('chân')) {
          acc.quads += exerciseVolume * 0.6
          acc.hamstrings += exerciseVolume * 0.4
        } else if (m.includes('calf') || m.includes('bắp chân')) acc.calves += exerciseVolume
        else if (m.includes('core') || m.includes('bụng')) acc.abs += exerciseVolume
      })
      return acc
    },
    { chest: 0, back: 0, shoulders: 0, biceps: 0, triceps: 0, quads: 0, hamstrings: 0, calves: 0, abs: 0 }
  )

  const getColor = (val: number) => {
    if (val === 0) return '#334155' // Grey (Chưa tập / Trống)
    if (val < 1500) return '#38bdf8' // Cyan (Nhẹ)
    if (val < 4000) return '#fbbf24' // Gold (Tối ưu)
    return '#ef4444' // Red (Cường độ cao / Overload)
  }

  return (
    <div className="aura-glass rounded-3xl p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
        <div>
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            🧬 SƠ ĐỒ PHÂN BỔ NHÓM CƠ (MUSCLE HEATMAP)
          </h3>
          <p className="text-xs font-mono text-slate-300 mt-1">
            Phân tích mức độ tác động khối lượng tạ thực tế ({workoutHistory.length} buổi tập)
          </p>
        </div>

        {/* Front / Back Toggle */}
        <div className="flex bg-[#070714] p-1 rounded-2xl border border-slate-700">
          <button
            onClick={() => setView('front')}
            className={`px-5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
              view === 'front' ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            MẶT TRƯỚC (FRONT)
          </button>
          <button
            onClick={() => setView('back')}
            className={`px-5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
              view === 'back' ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            MẶT SAU (BACK)
          </button>
        </div>
      </div>

      {/* SVG Human Vector Model */}
      <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-4">
        <div className="w-48 h-80 relative flex items-center justify-center">
          <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(251,191,36,0.15)]">
            {/* Head & Neck */}
            <circle cx="50" cy="20" r="12" fill="#475569" />
            <rect x="46" y="32" width="8" height="8" rx="2" fill="#475569" />

            {view === 'front' ? (
              <>
                {/* Chest */}
                <path d="M35 42 Q50 40 65 42 L62 62 Q50 64 38 62 Z" fill={getColor(intensities.chest)} stroke="#0f172a" strokeWidth="1" />
                {/* Abs */}
                <rect x="40" y="65" width="20" height="30" rx="4" fill={getColor(intensities.abs)} stroke="#0f172a" strokeWidth="1" />
                {/* Shoulders */}
                <circle cx="28" cy="45" r="7" fill={getColor(intensities.shoulders)} />
                <circle cx="72" cy="45" r="7" fill={getColor(intensities.shoulders)} />
                {/* Biceps */}
                <rect x="22" y="54" width="8" height="18" rx="4" fill={getColor(intensities.biceps)} />
                <rect x="70" y="54" width="8" height="18" rx="4" fill={getColor(intensities.biceps)} />
                {/* Quads */}
                <rect x="34" y="98" width="14" height="42" rx="5" fill={getColor(intensities.quads)} />
                <rect x="52" y="98" width="14" height="42" rx="5" fill={getColor(intensities.quads)} />
                {/* Calves */}
                <rect x="36" y="144" width="10" height="35" rx="4" fill={getColor(intensities.calves)} />
                <rect x="54" y="144" width="10" height="35" rx="4" fill={getColor(intensities.calves)} />
              </>
            ) : (
              <>
                {/* Back (Lats & Traps) */}
                <path d="M32 42 L68 42 L60 78 L40 78 Z" fill={getColor(intensities.back)} stroke="#0f172a" strokeWidth="1" />
                {/* Rear Shoulders */}
                <circle cx="28" cy="45" r="7" fill={getColor(intensities.shoulders)} />
                <circle cx="72" cy="45" r="7" fill={getColor(intensities.shoulders)} />
                {/* Triceps */}
                <rect x="21" y="54" width="8" height="18" rx="4" fill={getColor(intensities.triceps)} />
                <rect x="71" y="54" width="8" height="18" rx="4" fill={getColor(intensities.triceps)} />
                {/* Hamstrings */}
                <rect x="34" y="98" width="14" height="42" rx="5" fill={getColor(intensities.hamstrings)} />
                <rect x="52" y="98" width="14" height="42" rx="5" fill={getColor(intensities.hamstrings)} />
                {/* Calves */}
                <rect x="36" y="144" width="10" height="35" rx="4" fill={getColor(intensities.calves)} />
                <rect x="54" y="144" width="10" height="35" rx="4" fill={getColor(intensities.calves)} />
              </>
            )}
          </svg>
        </div>

        {/* Legend Indicator Box */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto text-xs font-mono">
          <div className="p-3.5 rounded-2xl bg-[#070714] border border-slate-800 flex items-center gap-3">
            <span className="w-4 h-4 rounded-md bg-[#334155] shrink-0" />
            <div>
              <p className="font-bold text-white">Chưa tập (0 kg)</p>
              <span className="text-[10px] text-slate-400">Cần bổ sung bài tập</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#070714] border border-slate-800 flex items-center gap-3">
            <span className="w-4 h-4 rounded-md bg-[#38bdf8] shrink-0" />
            <div>
              <p className="font-bold text-cyan-300">Tập nhẹ (&lt; 1.5k kg)</p>
              <span className="text-[10px] text-slate-400">Cường độ thấp</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#070714] border border-slate-800 flex items-center gap-3">
            <span className="w-4 h-4 rounded-md bg-[#fbbf24] shrink-0" />
            <div>
              <p className="font-bold text-amber-300">Tối ưu (1.5k–4k kg)</p>
              <span className="text-[10px] text-slate-400">Phát triển cơ tốt</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#070714] border border-slate-800 flex items-center gap-3">
            <span className="w-4 h-4 rounded-md bg-[#ef4444] shrink-0" />
            <div>
              <p className="font-bold text-red-400">Cường độ cao (&gt; 4k kg)</p>
              <span className="text-[10px] text-slate-400">Tăng tải lũy tiến</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { useState } from 'react'
