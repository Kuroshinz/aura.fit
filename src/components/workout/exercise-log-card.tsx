'use client'

import { useState } from 'react'
import { useWorkoutStore } from '@/store/use-workout-store'
import { Check, Plus, Dumbbell, Trophy, Calculator, X, Zap, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface ExerciseLogCardProps {
  exerciseId: string
  exerciseName: string
  muscleGroup: string
}

export function ExerciseLogCard({ exerciseId, exerciseName, muscleGroup }: ExerciseLogCardProps) {
  const { activeWorkout, updateSet, toggleCompleteSet, addSet, savePersonalRecord, personalRecords } = useWorkoutStore()
  const [showPRBadge, setShowPRBadge] = useState(false)
  
  // 1RM Inline Calculator State
  const [show1RMCalculator, setShow1RMCalculator] = useState(false)
  const [modalWeight, setModalWeight] = useState(70)
  const [modalReps, setModalReps] = useState(8)

  const exerciseSession = activeWorkout?.exercises.find((e) => e.exercise_id === exerciseId)
  if (!exerciseSession) return null

  // Quick 1RM formula calculation (Epley formula)
  const calculate1RM = (w: number, r: number) => {
    if (!w || !r) return 0
    return Math.round(w * (1 + r / 30))
  }

  const current1RM = calculate1RM(modalWeight, modalReps)
  const savedPR = personalRecords[exerciseName]?.oneRM || 0

  const handleSetToggle = (setId: string, isCurrentlyCompleted: boolean, weightKg: number, reps: number) => {
    toggleCompleteSet(exerciseId, setId)
    if (!isCurrentlyCompleted) {
      const set1RM = calculate1RM(weightKg, reps)
      
      // Auto-update PR if they hit a new personal record in normal sets!
      if (set1RM > savedPR && weightKg > 0 && reps > 0) {
        savePersonalRecord(exerciseName, weightKg, reps, set1RM)
        setShowPRBadge(true)
        setTimeout(() => setShowPRBadge(false), 5000)
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#fbbf24', '#f59e0b', '#a855f7', '#38bdf8', '#10b981'],
        })
      }
    }
  }

  const handleSaveCalculatorPR = () => {
    savePersonalRecord(exerciseName, modalWeight, modalReps, current1RM)
    setShowPRBadge(true)
    setTimeout(() => setShowPRBadge(false), 5000)
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#fbbf24', '#f59e0b', '#a855f7', '#38bdf8', '#10b981'],
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="aura-glass rounded-3xl p-5 md:p-8 mb-6 relative overflow-hidden"
    >
      {/* PR Celebration Banner */}
      <AnimatePresence>
        {showPRBadge && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-gradient-to-r from-amber-500/30 via-emerald-500/30 to-amber-500/30 border border-amber-400 rounded-2xl flex items-center justify-center gap-2 text-amber-300 font-mono text-sm font-extrabold shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-pulse overflow-hidden"
          >
            <Trophy className="w-5 h-5 text-amber-400 fill-current" />
            <span>🏆 KỶ LỤC 1RM MỚI: {current1RM > savedPR ? current1RM : savedPR}kg!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-700/80 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-500/30 to-indigo-500/20 border border-amber-400 rounded-2xl text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] shrink-0">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-display font-black text-white">{exerciseName}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full uppercase">
                {muscleGroup}
              </span>
              {savedPR > 0 && (
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 rounded-full flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> PR: {savedPR}kg
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Inline Calculator Toggle Button */}
        <button
          onClick={() => setShow1RMCalculator(!show1RMCalculator)}
          className={`p-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all w-full sm:w-auto ${
            show1RMCalculator 
            ? 'bg-slate-800 text-white border border-slate-600' 
            : 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{show1RMCalculator ? 'ĐÓNG MÁY TÍNH' : 'MÁY TÍNH 1RM'}</span>
          {show1RMCalculator ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Inline 1RM Calculator Panel */}
      <AnimatePresence>
        {show1RMCalculator && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-amber-500/30 shadow-inner">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                {/* Inputs */}
                <div className="col-span-1 sm:col-span-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">MỨC TẠ (KG)</label>
                  <input
                    type="number"
                    value={modalWeight || ''}
                    onChange={(e) => setModalWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#03030a] border border-slate-700 text-amber-400 font-mono font-bold text-xl px-3 py-3 rounded-xl text-center focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div className="col-span-1 sm:col-span-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">SỐ REPS</label>
                  <input
                    type="number"
                    value={modalReps || ''}
                    onChange={(e) => setModalReps(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#03030a] border border-slate-700 text-amber-400 font-mono font-bold text-xl px-3 py-3 rounded-xl text-center focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Instant Result */}
                <div className="col-span-2 sm:col-span-1 h-full flex flex-col justify-end">
                  <div className="w-full h-full bg-amber-500/10 border border-amber-500/40 rounded-xl flex items-center justify-center py-3 px-2 flex-col">
                    <span className="text-[9px] text-amber-300 uppercase font-bold tracking-widest">1RM ƯỚC TÍNH</span>
                    <span className="text-2xl font-black text-amber-400 font-mono">{current1RM} <span className="text-sm">kg</span></span>
                  </div>
                </div>

                {/* Save Button */}
                <div className="col-span-2 sm:col-span-1">
                  <button 
                    onClick={handleSaveCalculatorPR}
                    className="w-full py-3.5 btn-aura-gold text-black font-extrabold text-xs uppercase rounded-xl flex items-center justify-center gap-2 h-[52px]"
                  >
                    <Save className="w-4 h-4" />
                    LƯU KỶ LỤC
                  </button>
                </div>
              </div>
              
              {/* Overload Metrics */}
              {current1RM > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-wrap gap-4 text-[11px] font-mono text-slate-300">
                  <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-cyan-400" /> Tăng chuẩn: <strong className="text-white">{(modalWeight + 2.5).toFixed(1)} kg</strong></div>
                  <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emerald-400" /> Overload 5%: <strong className="text-white">{(modalWeight * 1.05).toFixed(1)} kg</strong></div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sets Column Header */}
      <div className="grid grid-cols-12 gap-2 sm:gap-3 text-[10px] sm:text-xs font-mono font-bold text-slate-400 uppercase mb-2 px-2 sm:px-3">
        <span className="col-span-2 text-center">SET</span>
        <span className="col-span-4 text-center">MỨC TẠ (KG)</span>
        <span className="col-span-4 text-center">REPS</span>
        <span className="col-span-2 text-center">XONG</span>
      </div>

      {/* Set Items List */}
      <div className="flex flex-col gap-3">
        {exerciseSession.sets.map((set, idx) => {
          const estimated1RM = calculate1RM(set.weight_kg, set.reps)

          return (
            <motion.div
              key={set.id}
              whileHover={{ scale: 1.01 }}
              className={`grid grid-cols-12 gap-2 sm:gap-3 items-center p-2 sm:p-3 rounded-2xl border transition-all ${
                set.is_completed
                  ? 'bg-gradient-to-r from-amber-500/20 via-emerald-950/40 to-slate-900/60 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                  : 'bg-[#070714] border-slate-700 hover:border-slate-500'
              }`}
            >
              {/* Set Index */}
              <div className="col-span-2 flex justify-center">
                <span className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-mono font-black text-sm sm:text-base flex items-center justify-center border ${
                  set.is_completed
                    ? 'bg-amber-400/30 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                    : 'bg-slate-900 text-slate-200 border-slate-700'
                }`}>
                  {idx + 1}
                </span>
              </div>

              {/* Weight Input */}
              <div className="col-span-4">
                <input
                  type="number"
                  value={set.weight_kg || ''}
                  onChange={(e) => updateSet(exerciseId, set.id, 'weight_kg', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-[#03030a] border border-slate-700 focus:border-amber-400 text-center text-white font-mono font-black text-lg sm:text-xl py-2.5 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/40 shadow-inner"
                />
              </div>

              {/* Reps Input & Live 1RM Badge */}
              <div className="col-span-4 relative">
                <input
                  type="number"
                  value={set.reps || ''}
                  onChange={(e) => updateSet(exerciseId, set.id, 'reps', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-[#03030a] border border-slate-700 focus:border-amber-400 text-center text-white font-mono font-black text-lg sm:text-xl py-2.5 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/40 shadow-inner"
                />
                {estimated1RM > 0 && (
                  <span className="absolute right-1 sm:right-2 bottom-1 text-[8px] sm:text-[9px] font-mono font-bold text-amber-400 bg-slate-900/90 px-1 py-0.5 rounded border border-amber-400/30 whitespace-nowrap">
                    1RM: {estimated1RM}
                  </span>
                )}
              </div>

              {/* Check Box */}
              <div className="col-span-2 flex justify-center">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleSetToggle(set.id, set.is_completed, set.weight_kg, set.reps)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all ${
                    set.is_completed
                      ? 'btn-aura-gold scale-105 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  <Check className={`w-6 h-6 sm:w-7 sm:h-7 ${set.is_completed ? 'stroke-[3]' : 'stroke-[2]'}`} />
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
        className="w-full mt-4 sm:mt-6 py-3.5 bg-slate-900/60 hover:bg-slate-900 border border-dashed border-slate-700 hover:border-amber-400 rounded-2xl text-amber-400 font-display font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
      >
        <Plus className="w-4 h-4 text-amber-400" />
        THÊM SET TIẾP THEO
      </motion.button>
    </motion.div>
  )
}
