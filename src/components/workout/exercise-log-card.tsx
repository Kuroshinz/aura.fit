'use client'

import { useState } from 'react'
import { useWorkoutStore } from '@/store/use-workout-store'
import { Check, Plus, Dumbbell, Trophy, Calculator, X, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface ExerciseLogCardProps {
  exerciseId: string
  exerciseName: string
  muscleGroup: string
}

export function ExerciseLogCard({ exerciseId, exerciseName, muscleGroup }: ExerciseLogCardProps) {
  const { activeWorkout, updateSet, toggleCompleteSet, addSet } = useWorkoutStore()
  const [showPRBadge, setShowPRBadge] = useState(false)
  const [show1RMModal, setShow1RMModal] = useState(false)
  const [modalWeight, setModalWeight] = useState(70)
  const [modalReps, setModalReps] = useState(8)

  const exerciseSession = activeWorkout?.exercises.find((e) => e.exercise_id === exerciseId)
  if (!exerciseSession) return null

  const handleSetToggle = (setId: string, isCurrentlyCompleted: boolean, weightKg: number) => {
    toggleCompleteSet(exerciseId, setId)
    if (!isCurrentlyCompleted) {
      if (weightKg >= 50) {
        setShowPRBadge(true)
        setTimeout(() => setShowPRBadge(false), 4000)
      }

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#fbbf24', '#f59e0b', '#a855f7', '#38bdf8', '#10b981'],
      })
    }
  }

  // Quick 1RM formula calculation
  const calculate1RM = (w: number, r: number) => {
    if (!w || !r) return 0
    return Math.round(w * (1 + r / 30))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="aura-glass rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden"
    >
      {/* PR Celebration Banner */}
      <AnimatePresence>
        {showPRBadge && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-3 bg-gradient-to-r from-amber-500/30 via-emerald-500/30 to-amber-500/30 border border-amber-400 rounded-2xl flex items-center justify-center gap-2 text-amber-300 font-mono text-sm font-extrabold shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-pulse"
          >
            <Trophy className="w-5 h-5 text-amber-400 fill-current" />
            <span>🏆 KỶ LỤC CÁ NHÂN MỚI (NEW PERSONAL RECORD)!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/80">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-500/30 to-indigo-500/20 border border-amber-400 rounded-2xl text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-display font-black text-white">{exerciseName}</h3>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full inline-block mt-1.5 uppercase">
              {muscleGroup}
            </span>
          </div>
        </div>

        {/* Quick 1RM Popup Trigger Button */}
        <button
          onClick={() => setShow1RMModal(true)}
          className="p-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 rounded-2xl text-amber-300 font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
        >
          <Calculator className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">MÁY TÍNH 1RM</span>
        </button>
      </div>

      {/* Sets Column Header */}
      <div className="grid grid-cols-12 gap-3 text-xs font-mono font-bold text-slate-300 uppercase mb-3 px-3">
        <span className="col-span-2 text-center">SET</span>
        <span className="col-span-4 text-center">MỨC TẠ (KG)</span>
        <span className="col-span-4 text-center">REPS (1RM)</span>
        <span className="col-span-2 text-center">HOÀN THÀNH</span>
      </div>

      {/* Set Items List */}
      <div className="flex flex-col gap-3">
        {exerciseSession.sets.map((set, idx) => {
          const estimated1RM = calculate1RM(set.weight_kg, set.reps)

          return (
            <motion.div
              key={set.id}
              whileHover={{ scale: 1.01 }}
              className={`grid grid-cols-12 gap-3 items-center p-3 rounded-2xl border transition-all ${
                set.is_completed
                  ? 'bg-gradient-to-r from-amber-500/20 via-emerald-950/40 to-slate-900/60 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                  : 'bg-[#070714] border-slate-700 hover:border-slate-500'
              }`}
            >
              {/* Set Index */}
              <div className="col-span-2 flex justify-center">
                <span className={`w-10 h-10 rounded-xl font-mono font-black text-base flex items-center justify-center border ${
                  set.is_completed
                    ? 'bg-amber-400/30 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                    : 'bg-slate-900 text-slate-200 border-slate-700'
                }`}>
                  0{idx + 1}
                </span>
              </div>

              {/* Weight Input */}
              <div className="col-span-4">
                <input
                  type="number"
                  value={set.weight_kg || ''}
                  onChange={(e) => updateSet(exerciseId, set.id, 'weight_kg', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-[#03030a] border border-slate-700 focus:border-amber-400 text-center text-white font-mono font-black text-xl py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/40 shadow-inner"
                />
              </div>

              {/* Reps Input & Live 1RM Badge */}
              <div className="col-span-4 relative">
                <input
                  type="number"
                  value={set.reps || ''}
                  onChange={(e) => updateSet(exerciseId, set.id, 'reps', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-[#03030a] border border-slate-700 focus:border-amber-400 text-center text-white font-mono font-black text-xl py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/40 shadow-inner"
                />
                {estimated1RM > 0 && (
                  <span className="absolute right-2 bottom-1 text-[9px] font-mono font-bold text-amber-400 bg-slate-900/90 px-1.5 py-0.5 rounded border border-amber-400/30">
                    1RM: ~{estimated1RM}kg
                  </span>
                )}
              </div>

              {/* Check Box */}
              <div className="col-span-2 flex justify-center">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleSetToggle(set.id, set.is_completed, set.weight_kg)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    set.is_completed
                      ? 'btn-aura-gold scale-105 shadow-[0_0_20px_rgba(251,191,36,0.6)]'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  <Check className={`w-7 h-7 ${set.is_completed ? 'stroke-[3]' : 'stroke-[2]'}`} />
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Add Set Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => addSet(exerciseId)}
        className="w-full mt-6 py-4 bg-slate-900/60 hover:bg-slate-900 border border-dashed border-slate-700 hover:border-amber-400 rounded-2xl text-amber-400 font-display font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5 text-amber-400" />
        THÊM SET TIẾP THEO
      </motion.button>

      {/* QUICK 1RM MODAL POPUP */}
      {show1RMModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aura-glass w-full max-w-md rounded-3xl p-6 shadow-2xl border-amber-400/50 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                MÁY TÍNH 1RM TRỰC TIẾP
              </h3>
              <button
                onClick={() => setShow1RMModal(false)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-slate-300 uppercase block mb-1">MỨC TẠ (KG)</label>
                <input
                  type="number"
                  value={modalWeight}
                  onChange={(e) => setModalWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#03030a] border border-slate-700 text-white font-mono font-bold text-xl px-3 py-2.5 rounded-xl text-center"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-slate-300 uppercase block mb-1">SỐ REPS</label>
                <input
                  type="number"
                  value={modalReps}
                  onChange={(e) => setModalReps(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#03030a] border border-slate-700 text-white font-mono font-bold text-xl px-3 py-2.5 rounded-xl text-center"
                />
              </div>
            </div>

            {/* Calculated Result */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-center space-y-1">
              <span className="text-xs font-mono text-amber-300 font-bold uppercase">SỨC MẠNH TỐI ĐA (1RM)</span>
              <p className="text-3xl font-extrabold text-amber-400 font-mono">
                {calculate1RM(modalWeight, modalReps)} kg
              </p>
            </div>

            {/* Overload Suggestion */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-mono space-y-1 text-slate-300">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-current" /> GỢI Ý MỨC TẠ BUỔI SAU:
              </span>
              <p>• Tăng chuẩn (+2.5kg): <strong className="text-white">{(modalWeight + 2.5).toFixed(1)} kg</strong></p>
              <p>• Tăng 5% (+5% Load): <strong className="text-cyan-300">{(modalWeight * 1.05).toFixed(1)} kg</strong></p>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
