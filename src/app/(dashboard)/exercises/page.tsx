'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Plus, Dumbbell, Sparkles, X, Check, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SpatialCard } from '@/components/effects/spatial-card'
import { createClient } from '@/lib/supabase/client'
import { useExerciseStore } from '@/store/useExerciseStore'
import { ExerciseDetailModal } from '@/components/library/exercise-detail-modal'

export interface ExerciseItem {
  id: string
  name: string
  muscle: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core'
  equipment: 'Barbell' | 'Dumbbell' | 'Cable' | 'Machine' | 'Bodyweight'
  isCustom?: boolean
}

export default function ExercisesPage() {
  const { getAllExercises } = useExerciseStore()
  const [exercisesList, setExercisesList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [search, setSearch] = useState('')
  const [filterMuscle, setFilterMuscle] = useState<string>('All')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [visibleCount, setVisibleCount] = useState(24)
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null)

  // New Exercise Form State
  const [newName, setNewName] = useState('')
  const [newMuscle, setNewMuscle] = useState('Chest')
  const [newEquipment, setNewEquipment] = useState('Barbell')

  useEffect(() => {
    // Instant offline load
    setExercisesList(getAllExercises())
    setIsLoading(false)
  }, [getAllExercises])

  useEffect(() => {
    setVisibleCount(24)
  }, [search, filterMuscle])

  const filtered = useMemo(() => {
    return exercisesList.filter((ex) => {
      const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase().trim())
      const matchMuscle = filterMuscle === 'All' || (() => {
        const exMuscle = (ex.muscleGroup || '').toLowerCase()
        const filterStr = filterMuscle.toLowerCase()
        if (exMuscle === filterStr) return true
        if (filterStr === 'legs' && (exMuscle.includes('leg') || exMuscle.includes('thigh') || exMuscle.includes('calf'))) return true
        if (filterStr === 'arms' && (exMuscle.includes('arm') || exMuscle.includes('bicep') || exMuscle.includes('tricep'))) return true
        if (filterStr === 'core' && (exMuscle.includes('waist') || exMuscle.includes('core') || exMuscle.includes('abs'))) return true
        return false
      })()
      return matchSearch && matchMuscle
    })
  }, [exercisesList, search, filterMuscle])

  const handleCreateCustomExercise = (e: React.FormEvent) => {
    e.preventDefault()
    // Normally would dispatch to useExerciseStore.addCustomExercise
    const newEx = {
      id: `custom_${Date.now()}`,
      name: newName.trim().toUpperCase(),
      muscleGroup: newMuscle,
      equipment: newEquipment,
      isCustom: true,
      difficulty: 'Beginner',
      metadata: {}
    }

    setExercisesList([newEx, ...exercisesList])
    setNewName('')
    setShowCreateModal(false)
    alert(`Đã thêm thành công bài tập cá nhân: ${newEx.name}!`)
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
        <div>
          <span className="text-sm font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
            EXERCISE DATABASE ({exercisesList.length}+ EXERCISES)
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            THƯ VIỆN BÀI TẬP CHUẨN KHOA HỌC
          </h1>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3.5 btn-aura-gold text-black font-extrabold rounded-2xl text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl"
        >
          <Plus className="w-5 h-5" />
          TẠO BÀI TẬP CÁ NHÂN
        </button>
      </div>

      {/* Glow Divider */}
      <div className="glow-divider" />

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm font-mono">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bài tập (VD: Bench Press, Squat, Curl...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-2xl pl-12 pr-4 py-3.5 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
        </div>

        {/* Filter Muscle Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'].map((muscle) => (
            <button
              key={muscle}
              onClick={() => setFilterMuscle(muscle)}
              className={`px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap tracking-wider transition-[background-color,color,box-shadow,border-color] duration-150 ${
                filterMuscle === muscle
                  ? 'bg-amber-400 text-black font-black shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                  : 'aura-glass text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Cards Grid with Framer Motion */}
      <div className="section-container section-glow-amber rounded-3xl p-6 sm:p-8 bg-slate-900/20 border border-slate-700/40">
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-3 mb-6">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          EXERCISE CARDS
        </h2>
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-12 flex flex-col justify-center items-center gap-4">
              <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-mono text-sm animate-pulse">Đang tải thư viện bài tập...</p>
            </div>
          ) : (
            <AnimatePresence>
            {filtered.slice(0, visibleCount).map((ex) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={ex.id}
                className="group h-full cursor-pointer"
                onClick={() => setSelectedExercise(ex)}
              >
                <SpatialCard intensity={8} className="h-full rounded-3xl p-6 flex flex-col justify-between border-slate-700/50 shadow-xl group-hover:border-amber-400/50 group-hover:shadow-[0_0_30px_rgba(251,191,36,0.15)] transition-all duration-300 bg-slate-900/40">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="p-3 bg-amber-500/20 border border-amber-400 rounded-2xl text-amber-400">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-white group-hover:text-amber-300 transition-colors">
                      {ex.name}
                    </h3>
                    {ex.isCustom && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 rounded-md uppercase">
                        Custom Exercise
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 mt-2">
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full uppercase">
                    {ex.muscleGroup}
                  </span>
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-900 text-slate-300 border border-slate-700 rounded-full uppercase">
                    {ex.equipment}
                  </span>
                </div>
                </SpatialCard>
              </motion.div>
            ))}
          </AnimatePresence>
          )}
        </motion.div>

        {!isLoading && visibleCount < filtered.length && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 24)}
              className="px-8 py-3 rounded-full border border-amber-500/30 text-amber-400 font-bold font-mono hover:bg-amber-500/10 transition-colors shadow-[0_0_15px_rgba(251,191,36,0.1)] hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            >
              HIỂN THỊ THÊM ({filtered.length - visibleCount})
            </button>
          </div>
        )}
      </div>

      {/* CREATE CUSTOM EXERCISE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aura-glass w-full max-w-md rounded-3xl p-8 shadow-2xl border-amber-400/50"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-2xl font-extrabold text-white">TẠO BÀI TẬP MỚI</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomExercise} className="space-y-5">
              <div>
                <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                  TÊN BÀI TẬP
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Incline Cable Fly"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-3.5 text-white font-mono text-base focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                  NHÓM CƠ CHÍNH
                </label>
                <select
                  value={newMuscle}
                  onChange={(e) => setNewMuscle(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-3.5 text-white font-mono text-base focus:outline-none"
                >
                  <option value="Chest">Chest (Ngực)</option>
                  <option value="Back">Back (Lưng/Xô)</option>
                  <option value="Legs">Legs (Đùi/Mông)</option>
                  <option value="Shoulders">Shoulders (Vai)</option>
                  <option value="Arms">Arms (Tay)</option>
                  <option value="Core">Core (Bụng)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                  DỤNG CỤ TẬP
                </label>
                <select
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-3.5 text-white font-mono text-base focus:outline-none"
                >
                  <option value="Barbell">Barbell (Tạ đòn dài)</option>
                  <option value="Dumbbell">Dumbbell (Tạ đôi)</option>
                  <option value="Cable">Cable (Dây cáp)</option>
                  <option value="Machine">Machine (Máy tập)</option>
                  <option value="Bodyweight">Bodyweight (Trọng lượng cơ thể)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 btn-aura-gold text-black font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 mt-8 shadow-2xl"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                LƯU BÀI TẬP VÀO THƯ VIỆN
              </button>
            </form>
          </motion.div>
        </div>
      )}
      {/* Detail Modal */}
      <ExerciseDetailModal 
        exercise={selectedExercise} 
        onClose={() => setSelectedExercise(null)} 
      />

    </div>
  )
}
