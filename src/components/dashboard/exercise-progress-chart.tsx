'use client'

import { useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { TrendingUp, Dumbbell } from 'lucide-react'
import { useWorkoutStore } from '@/store/use-workout-store'

export function ExerciseProgressChart() {
  const { workoutHistory } = useWorkoutStore()
  const [selectedExercise, setSelectedExercise] = useState('Bench Press')
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('30d')

  const cutoff = range === '7d'
    ? new Date(Date.now() - 7 * 864e5)
    : range === '30d'
    ? new Date(Date.now() - 30 * 864e5)
    : new Date(0)

  // Gom nhóm dữ liệu sức mạnh thực từ các buổi tập đã hoàn thành trong lịch sử
  const exerciseChartData = workoutHistory
    .filter(w => new Date(w.start_time) >= cutoff)
    .slice()
    .reverse()
    .reduce((acc: any[], w) => {
      const dateStr = new Date(w.start_time).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
      w.exercises.forEach((ex) => {
        const completedSets = ex.sets.filter((s) => s.is_completed)
        if (completedSets.length > 0) {
          const maxWeight = Math.max(...completedSets.map((s) => s.weight_kg))
          const bestSet = completedSets.find((s) => s.weight_kg === maxWeight)
          const estimated1RM = bestSet ? Math.round(bestSet.weight_kg * (1 + bestSet.reps / 30)) : maxWeight

          acc.push({
            date: dateStr,
            exerciseName: ex.exercise_name,
            maxWeight,
            estimated1RM,
          })
        }
      })
      return acc
    }, [])

  // Danh sách các bài tập thực đã tập
  const availableExercises = Array.from(new Set(exerciseChartData.map((d) => d.exerciseName)))
  const activeSelected = availableExercises.includes(selectedExercise)
    ? selectedExercise
    : availableExercises[0] || 'Bench Press'

  const filteredData = exerciseChartData.filter((d) => d.exerciseName === activeSelected)

  return (
    <div className="aura-glass rounded-3xl p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
        <div>
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            📉 TIẾN TRÌNH SỨC MẠNH RIÊNG TỪNG BÀI TẬP
          </h3>
          <p className="text-xs font-mono text-slate-300 mt-1">Theo dõi mức tạ nặng nhất &amp; chỉ số 1RM ước tính thực tế</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Range Filter Buttons */}
          <div className="flex gap-1">
            {(['7d', '30d', 'all'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all ${
                  range === r
                    ? 'bg-amber-400 text-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {r === '7d' ? '7 ngày' : r === '30d' ? '30 ngày' : 'Tất cả'}
              </button>
            ))}
          </div>

          {/* Exercise Selector Dropdown */}
          {availableExercises.length > 0 && (
            <select
              value={activeSelected}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="bg-[#070714] border border-slate-700 text-white font-bold text-sm px-4 py-2.5 rounded-2xl focus:outline-none focus:border-amber-400"
            >
              {availableExercises.map((exName) => (
                <option key={exName} value={exName}>
                  {exName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="py-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-2xl">
          Chưa có dữ liệu bài tập thực tế. Hãy bấm "TẬP NGAY" ở trang Lịch Tập để ghi nhận sức mạnh!
        </div>
      ) : (
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} fontFamily="var(--font-mono)" tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} fontFamily="var(--font-mono)" tickLine={false} unit="kg" />
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
              <Line type="monotone" dataKey="maxWeight" name="Mức Tạ Nặng Nhất (kg)" stroke="#fbbf24" strokeWidth={3} dot={{ r: 5, fill: '#fbbf24' }} />
              <Line type="monotone" dataKey="estimated1RM" name="1RM Ước Tính (kg)" stroke="#38bdf8" strokeWidth={3} strokeDasharray="4 4" dot={{ r: 4, fill: '#38bdf8' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
