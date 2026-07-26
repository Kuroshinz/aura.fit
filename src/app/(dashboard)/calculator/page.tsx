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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
            POWER &amp; PROGRESSIVE OVERLOAD CALCULATOR
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white font-display">
            MÁY TÍNH <span className="gold-gradient-text">1RM &amp; GỢI Ý TĂNG TẠ</span>
          </h1>
        </div>
      </div>

      {/* Glow Divider */}
      <div className="glow-divider" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Controls Card */}
        <div className="lg:col-span-5 section-container section-glow-amber rounded-3xl p-6 md:p-8 space-y-6 bg-slate-900/20 border border-slate-700/40">
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

        {/* Results Cards Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="section-container section-glow-indigo rounded-3xl p-6 md:p-8 bg-slate-900/20 border border-slate-700/40 space-y-5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
              EPLEY FORMULA
            </h3>
            <div className="text-center">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Ước tính 1RM</span>
              <p className="text-5xl font-black text-indigo-300 mt-1">{epley1RM} <span className="text-lg text-slate-400 font-mono">Kg</span></p>
              <p className="text-xs text-slate-400 font-mono mt-2">1RM = W × (1 + R/30)</p>
            </div>
          </div>

          <div className="section-container section-glow-cyan rounded-3xl p-6 md:p-8 bg-slate-900/20 border border-slate-700/40 space-y-5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
              BRZYCKI FORMULA
            </h3>
            <div className="text-center">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Ước tính 1RM</span>
              <p className="text-5xl font-black text-cyan-300 mt-1">{brzycki1RM} <span className="text-lg text-slate-400 font-mono">Kg</span></p>
              <p className="text-xs text-slate-400 font-mono mt-2">1RM = W × 36/(37-R)</p>
            </div>
          </div>

          <div className="section-container section-glow-emerald rounded-3xl p-6 md:p-8 sm:col-span-2 bg-slate-900/20 border border-slate-700/40 space-y-5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(10,185,129,0.6)]" />
              KẾT QUẢ TRUNG BÌNH &amp; PHÂN TÍCH
            </h3>
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
