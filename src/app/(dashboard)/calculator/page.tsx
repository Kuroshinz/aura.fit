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

  // Plate Calculator (assumes 20kg bar, standard plates)
  const barWeight = 20
  const perSide = Math.max(0, (weight - barWeight) / 2)

  function calculatePlates(loadPerSide: number): Record<number, number> {
    const plates = [25, 20, 15, 10, 5, 2.5]
    const result: Record<number, number> = {}
    let remaining = loadPerSide
    for (const p of plates) {
      const count = Math.floor(remaining / p)
      if (count > 0) {
        result[p] = count
        remaining = Math.round((remaining - count * p) * 100) / 100
      }
    }
    return result
  }

  const plateMap = calculatePlates(perSide)

  // Rep Range % Table based on average 1RM
  const repRangeTable = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15].map(r => ({
    reps: r,
    pct: Math.round(100 / (1 + r / 30)),
    kg: Math.round(average1RM * (100 / (1 + r / 30)) / 100),
  }))

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

      {/* Plate Calculator */}
      <div className="aura-glass rounded-3xl p-6 md:p-8 space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          🏋️ Cách xếp tạ <span className="text-base font-normal text-white">(bar 20kg)</span>
          <span className="text-xs font-mono text-slate-400 font-normal ml-1">— mỗi bên</span>
        </h3>
        {Object.keys(plateMap).length === 0 ? (
          <p className="text-slate-500 font-mono text-sm">Không có tạ nào ngoài đòn (hoặc nhẹ hơn 20kg)</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Object.entries(plateMap).sort((a, b) => Number(b[0]) - Number(a[0])).map(([plate, count]) => (
              <span key={plate} className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono font-bold text-sm">
                {count}× {plate}kg
              </span>
            ))}
          </div>
        )}
        <p className="text-[11px] text-slate-500 font-mono">Tổng tải mỗi bên: <span className="text-slate-400 font-bold">{perSide.toFixed(1)} kg</span></p>
      </div>

      {/* Rep Range Table */}
      <div className="aura-glass rounded-3xl p-6 md:p-8 space-y-4">
        <h3 className="text-xl font-bold text-white">📊 Bảng % theo số Reps</h3>
        <p className="text-xs text-slate-400 font-mono">Dựa trên 1RM trung bình của bạn: <strong className="text-amber-400">{average1RM} kg</strong></p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 uppercase">
                <th className="text-left py-2 pr-4">Reps</th>
                <th className="text-left py-2 pr-4">% 1RM</th>
                <th className="text-left py-2">Mục tiêu (kg)</th>
              </tr>
            </thead>
            <tbody>
              {repRangeTable.map(row => (
                <tr
                  key={row.reps}
                  className={`border-b border-slate-800/50 transition-colors ${row.reps === reps ? 'bg-amber-500/10 text-amber-300' : 'text-slate-300 hover:bg-slate-800/30'}`}
                >
                  <td className="py-2 pr-4 font-bold">{row.reps} reps</td>
                  <td className="py-2 pr-4">{row.pct}%</td>
                  <td className="py-2 font-bold">{row.kg} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
