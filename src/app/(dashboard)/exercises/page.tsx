'use client'

import { useState } from 'react'
import { Search, Plus, Dumbbell, Sparkles, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ExerciseItem {
  id: string
  name: string
  muscle: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core'
  equipment: 'Barbell' | 'Dumbbell' | 'Cable' | 'Machine' | 'Bodyweight'
  isCustom?: boolean
}

const initialExercises: ExerciseItem[] = [
  // CHEST
  { id: 'c1', name: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell' },
  { id: 'c2', name: 'Incline Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbell' },
  { id: 'c3', name: 'Machine Chest Press', muscle: 'Chest', equipment: 'Machine' },
  { id: 'c4', name: 'Pec Deck Fly (Ép Ngực)', muscle: 'Chest', equipment: 'Machine' },
  { id: 'c5', name: 'Cable Chest Fly', muscle: 'Chest', equipment: 'Cable' },
  { id: 'c6', name: 'Incline Barbell Press', muscle: 'Chest', equipment: 'Barbell' },
  { id: 'c7', name: 'Weighted Dips', muscle: 'Chest', equipment: 'Bodyweight' },
  { id: 'c8', name: 'Push Ups', muscle: 'Chest', equipment: 'Bodyweight' },

  // BACK
  { id: 'b1', name: 'Lat Pulldown', muscle: 'Back', equipment: 'Cable' },
  { id: 'b2', name: 'Chest Supported Row', muscle: 'Back', equipment: 'Machine' },
  { id: 'b3', name: 'Seated Cable Row', muscle: 'Back', equipment: 'Cable' },
  { id: 'b4', name: 'Barbell Bent Over Row', muscle: 'Back', equipment: 'Barbell' },
  { id: 'b5', name: 'Pull Ups (Hít Xô)', muscle: 'Back', equipment: 'Bodyweight' },
  { id: 'b6', name: 'T-Bar Row', muscle: 'Back', equipment: 'Barbell' },
  { id: 'b7', name: 'Single Arm Dumbbell Row', muscle: 'Back', equipment: 'Dumbbell' },
  { id: 'b8', name: 'Straight Arm Cable Pulldown', muscle: 'Back', equipment: 'Cable' },

  // LEGS
  { id: 'l1', name: 'Barbell Squat', muscle: 'Legs', equipment: 'Barbell' },
  { id: 'l2', name: 'Leg Press', muscle: 'Legs', equipment: 'Machine' },
  { id: 'l3', name: 'Hack Squat', muscle: 'Legs', equipment: 'Machine' },
  { id: 'l4', name: 'Romanian Deadlift (RDL)', muscle: 'Legs', equipment: 'Barbell' },
  { id: 'l5', name: 'Lying Leg Curl', muscle: 'Legs', equipment: 'Machine' },
  { id: 'l6', name: 'Leg Extension', muscle: 'Legs', equipment: 'Machine' },
  { id: 'l7', name: 'Hip Abduction Machine', muscle: 'Legs', equipment: 'Machine' },
  { id: 'l8', name: 'Standing Calf Raise', muscle: 'Legs', equipment: 'Machine' },
  { id: 'l9', name: 'Bulgarian Split Squat', muscle: 'Legs', equipment: 'Dumbbell' },

  // SHOULDERS
  { id: 's1', name: 'Overhead Barbell Press (OHP)', muscle: 'Shoulders', equipment: 'Barbell' },
  { id: 's2', name: 'Machine Shoulder Press', muscle: 'Shoulders', equipment: 'Machine' },
  { id: 's3', name: 'Dumbbell Lateral Raise', muscle: 'Shoulders', equipment: 'Dumbbell' },
  { id: 's4', name: 'Cable Lateral Raise', muscle: 'Shoulders', equipment: 'Cable' },
  { id: 's5', name: 'Face Pull', muscle: 'Shoulders', equipment: 'Cable' },
  { id: 's6', name: 'Rear Delt Pec Deck Fly', muscle: 'Shoulders', equipment: 'Machine' },
  { id: 's7', name: 'Dumbbell Front Raise', muscle: 'Shoulders', equipment: 'Dumbbell' },

  // ARMS
  { id: 'a1', name: 'Barbell Bicep Curl', muscle: 'Arms', equipment: 'Barbell' },
  { id: 'a2', name: 'Dumbbell Hammer Curl', muscle: 'Arms', equipment: 'Dumbbell' },
  { id: 'a3', name: 'Rope Cable Curl', muscle: 'Arms', equipment: 'Cable' },
  { id: 'a4', name: 'Preacher Curl', muscle: 'Arms', equipment: 'Machine' },
  { id: 'a5', name: 'Cable Tricep Pushdown', muscle: 'Arms', equipment: 'Cable' },
  { id: 'a6', name: 'Overhead Cable Tricep Extension', muscle: 'Arms', equipment: 'Cable' },
  { id: 'a7', name: 'Skullcrusher (Lying Tricep Ext)', muscle: 'Arms', equipment: 'Barbell' },
  { id: 'a8', name: 'Incline Dumbbell Curl', muscle: 'Arms', equipment: 'Dumbbell' },

  // CORE
  { id: 'r1', name: 'Cable Crunch', muscle: 'Core', equipment: 'Cable' },
  { id: 'r2', name: 'Hanging Leg Raise', muscle: 'Core', equipment: 'Bodyweight' },
  { id: 'r3', name: 'Ab Wheel Rollout', muscle: 'Core', equipment: 'Bodyweight' },
  { id: 'r4', name: 'Weighted Decline Sit-up', muscle: 'Core', equipment: 'Bodyweight' },
  { id: 'r5', name: 'Plank', muscle: 'Core', equipment: 'Bodyweight' },
]

export default function ExercisesPage() {
  const [exercisesList, setExercisesList] = useState<ExerciseItem[]>(initialExercises)
  const [search, setSearch] = useState('')
  const [filterMuscle, setFilterMuscle] = useState<string>('All')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // New Exercise Form State
  const [newName, setNewName] = useState('')
  const [newMuscle, setNewMuscle] = useState<ExerciseItem['muscle']>('Chest')
  const [newEquipment, setNewEquipment] = useState<ExerciseItem['equipment']>('Barbell')

  const filtered = exercisesList.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase())
    const matchesMuscle = filterMuscle === 'All' || ex.muscle === filterMuscle
    return matchesSearch && matchesMuscle
  })

  const handleCreateCustomExercise = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    const newEx: ExerciseItem = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      muscle: newMuscle,
      equipment: newEquipment,
      isCustom: true,
    }

    setExercisesList([newEx, ...exercisesList])
    setNewName('')
    setShowCreateModal(false)
    alert(`Đã thêm thành công bài tập cá nhân: ${newEx.name}!`)
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-700/80 pb-6">
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
              className={`px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap tracking-wider transition-all ${
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
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filtered.map((ex) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              key={ex.id}
              className="aura-glass rounded-3xl p-6 flex flex-col justify-between hover:border-amber-400/60 transition-all duration-300 group border-slate-700 shadow-xl"
            >
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
                  {ex.muscle}
                </span>
                <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-900 text-slate-300 border border-slate-700 rounded-full uppercase">
                  {ex.equipment}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

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
                  <option value="Barbell">Barbell (Tạ đơn dài)</option>
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
    </div>
  )
}
