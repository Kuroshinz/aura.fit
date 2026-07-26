'use client'

import React, { useState } from 'react'

export default function CalculatorPage() {
  const [weight, setWeight] = useState<number>(70)
  const [reps, setReps] = useState<number>(8)

  // Epley Formula: 1RM = Weight * (1 + Reps/30)
  const epley1RM = Math.round(weight * (1 + reps / 30))
  // Brzycki Formula: 1RM = Weight * (36 / (37 - Reps))
  const brzycki1RM = Math.round(weight * (36 / (37 - Math.min(reps, 36))))

  const average1RM = Math.round((epley1RM + brzycki1RM) / 2)

  // Progressive Overload Suggestions
  const nextTargetLight = (weight + 2.5).toFixed(1)
  const nextTargetHeavy = (weight * 1.05).toFixed(1)

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-700/80 pb-6">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
            POWER &amp; PROGRESSIVE OVERLOAD CALCULATOR
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white font-display">
            MÁY TÍNH <span className="gold-gradient-text">1RM &amp; GỢI Ý TĂNG TẠ</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Controls Card */}
        <div className="lg:col-span-5 aura-glass rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-4">
            <span>🧮</span> NHẬP THÔNG SỐ TẬP
          </h3>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                MỨC TẠ NÂNG ĐƯỢC (KG)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#03030a] border border-slate-700 focus:border-amber-400 text-white font-mono font-black text-2xl px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                SỐ REPS THỰC HIỆN ĐƯỢC
              </label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                className="w-full bg-[#03030a] border border-slate-700 focus:border-amber-400 text-white font-mono font-black text-2xl px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              />
            </div>
          </div>

          {/* Overload Suggestion */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-400/40 space-y-2">
            <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider block">
              ⚡ GỢI Ý TĂNG TẠ TỐI ƯU TUẦN TỚI
            </span>
            <p className="text-sm text-slate-200 font-medium">
              • Tăng chuẩn (+2.5kg): <strong className="text-amber-300 font-mono text-base">{nextTargetLight} kg</strong>
            </p>
            <p className="text-sm text-slate-200 font-medium">
              • Tăng 5% (+5% Load): <strong className="text-cyan-300 font-mono text-base">{nextTargetHeavy} kg</strong>
            </p>
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-7 aura-glass rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-4">
            <span>✨</span> KẾT QUẢ SỨC MẠNH TỐI ĐA (1RM)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700 text-center">
              <span className="text-xs font-mono text-slate-400 block mb-1">EPLEY FORMULA</span>
              <p className="text-3xl font-extrabold text-amber-400 font-mono">{epley1RM} kg</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700 text-center">
              <span className="text-xs font-mono text-slate-400 block mb-1">BRZYCKI FORMULA</span>
              <p className="text-3xl font-extrabold text-cyan-300 font-mono">{brzycki1RM} kg</p>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-indigo-500/20 border border-amber-400 text-center shadow-lg">
              <span className="text-xs font-mono text-amber-300 font-bold block mb-1">TRUNG BÌNH 1RM</span>
              <p className="text-3xl font-extrabold text-white font-mono">{average1RM} kg</p>
            </div>
          </div>

          {/* Percentage Target Table */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
              BẢNG PHÂN CHIA NĂNG LƯỢNG TẬP LUYỆN
            </h4>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="font-bold text-amber-400">90% 1RM (Sức Mạnh Tối Đa 2-3 Reps)</span>
                <span className="font-extrabold text-white">{Math.round(average1RM * 0.9)} kg</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="font-bold text-emerald-400">80% 1RM (Tăng Cơ Hypertrophy 6-8 Reps)</span>
                <span className="font-extrabold text-white">{Math.round(average1RM * 0.8)} kg</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="font-bold text-sky-400">70% 1RM (Bền Bỉ Hypertrophy 10-12 Reps)</span>
                <span className="font-extrabold text-white">{Math.round(average1RM * 0.7)} kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
