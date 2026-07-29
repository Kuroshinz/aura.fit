'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useWorkoutStore, CompletedWorkout } from '@/store/use-workout-store'
import { SpatialCard } from '@/components/effects/spatial-card'
import { motion } from 'framer-motion'
import { Search, TrendingUp, Dumbbell, Target, X, ChevronDown, ChevronUp } from 'lucide-react'

export default function ExerciseHistoryPage() {
  const { workoutHistory } = useWorkoutStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all')
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set())

  // Aggregate exercises
  const exerciseAggregates = useMemo(() => {
    const map = new Map<string, {
      name: string
      muscleGroup: string
      totalSets: number
      totalReps: number
      maxWeight: number
      volume: number
      occurrences: number
      lastDate: string
      setsHistory: { date: string; weight: number; reps: number }[]
    }>()

    workoutHistory.forEach(w => {
      w.exercises.forEach(ex => {
        const key = ex.exercise_name
        const existing = map.get(key) || {
          name: ex.exercise_name,
          muscleGroup: ex.muscle_group || 'Unknown',
          totalSets: 0,
          totalReps: 0,
          maxWeight: 0,
          volume: 0,
          occurrences: 0,
          lastDate: '',
          setsHistory: [],
        }

        existing.totalSets += ex.sets.length
        existing.occurrences += 1
        ex.sets.forEach(s => {
          existing.totalReps += s.reps
          existing.volume += s.weight_kg * s.reps
          if (s.weight_kg > existing.maxWeight) existing.maxWeight = s.weight_kg
          existing.setsHistory.push({
            date: new Date(w.start_time).toLocaleDateString('vi-VN'),
            weight: s.weight_kg,
            reps: s.reps,
          })
        })

        const dateStr = new Date(w.start_time).toLocaleDateString('vi-VN')
        if (dateStr > existing.lastDate) existing.lastDate = dateStr

        map.set(key, existing)
      })
    })

    return Array.from(map.values()).sort((a, b) => b.occurrences - a.occurrences)
  }, [workoutHistory])

  const filtered = useMemo(() => {
    return exerciseAggregates.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesMuscle = selectedMuscle === 'all' || ex.muscleGroup.toLowerCase() === selectedMuscle.toLowerCase()
      return matchesSearch && matchesMuscle
    })
  }, [exerciseAggregates, searchTerm, selectedMuscle])

  const muscleGroups = useMemo(() => {
    const set = new Set(exerciseAggregates.map(ex => ex.muscleGroup))
    return ['all', ...Array.from(set).sort()]
  }, [exerciseAggregates])

  const toggleExpand = (name: string) => {
    setExpandedExercises(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
          EXERCISE TRACKER
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          LỊCH SỬ BÀI TẬP
        </h1>
      </div>

      <div className="glow-divider" />

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm bài tập..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#070714] border border-slate-700 focus:border-amber-400 rounded-2xl pl-10 pr-4 py-3 text-white font-mono text-sm placeholder:text-slate-600 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {muscleGroups.map(mg => (
            <button
              key={mg}
              onClick={() => setSelectedMuscle(mg)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                selectedMuscle === mg
                  ? 'bg-amber-400 text-black'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-amber-400/50'
              }`}
            >
              {mg === 'all' ? 'Tất cả' : mg}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SpatialCard className="p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Tổng bài tập</span>
          </div>
          <p className="text-2xl font-extrabold text-white">{exerciseAggregates.length}</p>
        </SpatialCard>
        <SpatialCard className="p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Tổng buổi tập</span>
          </div>
          <p className="text-2xl font-extrabold text-white">{workoutHistory.length}</p>
        </SpatialCard>
        <SpatialCard className="p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Nhóm cơ</span>
          </div>
          <p className="text-2xl font-extrabold text-white">{muscleGroups.length - 1}</p>
        </SpatialCard>
      </div>

      {/* Exercise List */}
      {filtered.length === 0 ? (
        <div className="aura-glass rounded-3xl p-12 text-center">
          <Dumbbell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-sans">
            {searchTerm || selectedMuscle !== 'all'
              ? 'Không tìm thấy bài tập nào phù hợp.'
              : 'Chưa có dữ liệu bài tập. Hãy bắt đầu tập luyện!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ex, idx) => (
            <motion.div
              key={ex.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="aura-glass rounded-2xl p-5 border-slate-700 hover:border-amber-400/40 transition-all cursor-pointer"
              onClick={() => toggleExpand(ex.name)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white truncate">{ex.name}</h3>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-mono font-bold whitespace-nowrap">
                      {ex.muscleGroup}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-slate-400">
                    <span>🔥 {ex.occurrences} lần tập</span>
                    <span>🏋️ Max {ex.maxWeight}kg</span>
                    <span>📦 {ex.volume.toLocaleString()}kg volume</span>
                  </div>
                </div>
                {expandedExercises.has(ex.name) ? (
                  <ChevronUp className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                )}
              </div>

              {/* Expanded detail */}
              {expandedExercises.has(ex.name) && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="grid grid-cols-4 gap-2 text-center mb-4">
                    <div className="p-2 rounded-xl bg-slate-900/50">
                      <p className="text-xs font-mono text-slate-400">Sets</p>
                      <p className="text-lg font-extrabold text-white">{ex.totalSets}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/50">
                      <p className="text-xs font-mono text-slate-400">Reps</p>
                      <p className="text-lg font-extrabold text-white">{ex.totalReps}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/50">
                      <p className="text-xs font-mono text-slate-400">Max KG</p>
                      <p className="text-lg font-extrabold text-amber-400">{ex.maxWeight}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/50">
                      <p className="text-xs font-mono text-slate-400">Gần nhất</p>
                      <p className="text-lg font-extrabold text-cyan-400 text-sm">{ex.lastDate}</p>
                    </div>
                  </div>
                  
                  {/* Recent sets */}
                  {ex.setsHistory.length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono font-bold text-slate-500 uppercase mb-2">Lịch sử Sets gần đây</p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {ex.setsHistory.slice(-15).reverse().map((set, i) => (
                          <div key={i} className="flex justify-between text-xs font-mono text-slate-400 bg-slate-900/30 rounded-lg px-3 py-1.5">
                            <span>{set.date}</span>
                            <span>{set.weight}kg × {set.reps} reps</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
