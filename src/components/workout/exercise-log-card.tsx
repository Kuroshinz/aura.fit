'use client'

import { useState, memo } from 'react'
import { useWorkoutStore } from '@/store/use-workout-store'
import { useShallow } from 'zustand/react/shallow'
import { Check, Plus, Dumbbell, Trophy, Calculator, X, Zap, Save, ChevronDown, ChevronUp, Trash2, Edit3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useToastStore } from '@/components/effects/toast'

const SET_TYPE_COLORS: Record<string, string> = {
  'Normal': 'text-slate-400 bg-transparent border-transparent',
  'Warmup': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'Drop Set': 'text-orange-400 bg-orange-500/10 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]',
  'Failure': 'text-red-400 bg-red-500/10 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
  'Backoff': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'AMRAP': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
}

interface ExerciseLogCardProps {
  exerciseId: string
  exerciseName: string
  muscleGroup: string
}

export const ExerciseLogCard = memo(function ExerciseLogCard({ exerciseId, exerciseName, muscleGroup }: ExerciseLogCardProps) {
  const { updateSet, updateSetType, toggleCompleteSet, addSet, savePersonalRecord, personalRecords, removeSet, removeExercise, undoLastAction, updateExerciseNotes } = useWorkoutStore(useShallow((s) => ({
    updateSet: s.updateSet,
    updateSetType: s.updateSetType,
    toggleCompleteSet: s.toggleCompleteSet,
    addSet: s.addSet,
    savePersonalRecord: s.savePersonalRecord,
    personalRecords: s.personalRecords,
    removeSet: s.removeSet,
    removeExercise: s.removeExercise,
    undoLastAction: s.undoLastAction,
    updateExerciseNotes: s.updateExerciseNotes
  })))
  
  const exerciseSession = useWorkoutStore(s => s.activeWorkout?.exercises.find(e => e.exercise_id === exerciseId))
  const [showPRBadge, setShowPRBadge] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  
  // 1RM Inline Calculator State
  const [show1RMCalculator, setShow1RMCalculator] = useState(false)
  const [modalWeight, setModalWeight] = useState(70)
  const [modalReps, setModalReps] = useState(8)

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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Notes Toggle Button */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              showNotes 
              ? 'bg-slate-800 text-white border border-slate-600 shadow-inner' 
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-transparent'
            }`}
            title="Ghi chú bài tập"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Inline Calculator Toggle Button */}
          <button
            onClick={() => setShow1RMCalculator(!show1RMCalculator)}
            className={`p-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all flex-1 sm:flex-none ${
              show1RMCalculator 
              ? 'bg-slate-800 text-white border border-slate-600' 
              : 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>{show1RMCalculator ? 'ĐÓNG MÁY TÍNH' : 'MÁY TÍNH 1RM'}</span>
            {show1RMCalculator ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            aria-label="Xóa bài tập"
            onClick={() => {
              removeExercise(exerciseId)
              useToastStore.getState().addToast({
                variant: 'info',
                title: 'Đã xóa bài tập',
                message: `Đã xóa "${exerciseName}" khỏi buổi tập.`,
                duration: 5000,
                action: {
                  label: 'HOÀN TÁC',
                  onClick: () => undoLastAction()
                }
              })
            }}
            className="p-3 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
            title="Xóa bài tập"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notes Panel */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="relative">
              <textarea
                value={exerciseSession.notes || ''}
                onChange={(e) => updateExerciseNotes(exerciseId, e.target.value)}
                placeholder="Ghi chú cho bài tập này (cảm nhận cơ, setup, v.v...)"
                className="w-full bg-[#03030a] border border-slate-700 focus:border-amber-400 text-slate-300 font-sans text-sm p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 min-h-[100px] resize-y"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-col gap-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">TIẾP THEO BẠN CÓ THỂ THỬ:</span>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => {
                        addSet(exerciseId)
                        setTimeout(() => {
                          const ex = useWorkoutStore.getState().activeWorkout?.exercises.find(e => e.exercise_id === exerciseId)
                          if (ex) {
                            const lastSet = ex.sets[ex.sets.length - 1]
                            updateSet(exerciseId, lastSet.id, 'weight_kg', parseFloat((modalWeight + 2.5).toFixed(1)))
                            updateSet(exerciseId, lastSet.id, 'reps', modalReps)
                          }
                        }, 50)
                      }}
                      className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl font-mono text-xs flex items-center gap-2 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5" /> Tăng chuẩn (+2.5kg): <strong className="text-white">{(modalWeight + 2.5).toFixed(1)} kg</strong>
                    </button>
                    
                    <button 
                      onClick={() => {
                        addSet(exerciseId)
                        setTimeout(() => {
                          const ex = useWorkoutStore.getState().activeWorkout?.exercises.find(e => e.exercise_id === exerciseId)
                          if (ex) {
                            const lastSet = ex.sets[ex.sets.length - 1]
                            updateSet(exerciseId, lastSet.id, 'weight_kg', parseFloat((modalWeight * 1.05).toFixed(1)))
                            updateSet(exerciseId, lastSet.id, 'reps', modalReps)
                          }
                        }, 50)
                      }}
                      className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl font-mono text-xs flex items-center gap-2 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5" /> Overload (+5%): <strong className="text-white">{(modalWeight * 1.05).toFixed(1)} kg</strong>
                    </button>
                  </div>
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
      <div className="flex flex-col gap-1.5">
        {exerciseSession.sets.map((set, idx) => {
          const estimated1RM = calculate1RM(set.weight_kg, set.reps)

          return (
            <motion.div
              key={set.id}
              whileHover={{ scale: 1.01 }}
              className={`grid grid-cols-12 gap-2 sm:gap-3 items-center p-1.5 sm:p-2 rounded-xl border transition-all ${
                set.is_completed
                  ? 'bg-gradient-to-r from-amber-500/20 via-emerald-950/40 to-slate-900/60 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                  : 'bg-[#070714] border-slate-700 hover:border-slate-500'
              } ${set.set_type === 'Drop Set' ? 'border-orange-500/30' : ''} ${set.set_type === 'Failure' ? 'border-red-500/30' : ''}`}
            >
              {/* Set Index & Type */}
              <div className="col-span-2 flex flex-col items-center justify-center gap-1">
                <span className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-mono font-black text-sm sm:text-base flex items-center justify-center border ${
                  set.is_completed
                    ? 'bg-amber-400/30 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                    : 'bg-slate-900 text-slate-200 border-slate-700'
                }`}>
                  {idx + 1}
                </span>
                
                <select
                  value={set.set_type || 'Normal'}
                  onChange={(e) => updateSetType(exerciseId, set.id, e.target.value as any)}
                  className={`w-14 sm:w-16 bg-transparent text-[9px] sm:text-[10px] font-bold font-mono outline-none cursor-pointer appearance-none text-center rounded border px-0.5 py-0.5 ${SET_TYPE_COLORS[set.set_type || 'Normal'] || SET_TYPE_COLORS['Normal']}`}
                >
                  {Object.keys(SET_TYPE_COLORS).map(type => (
                    <option key={type} value={type} className="bg-slate-900 text-white">{type}</option>
                  ))}
                </select>
              </div>

              {/* Weight Input */}
              <div className="col-span-4 relative pb-4">
                <input
                  type="number"
                  inputMode="decimal"
                  enterKeyHint="next"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const formElements = Array.from(document.querySelectorAll('input, button'));
                      const index = formElements.indexOf(e.currentTarget);
                      if (index > -1 && index + 1 < formElements.length) {
                         (formElements[index + 1] as HTMLElement).focus();
                      }
                    }
                  }}
                  value={set.weight_kg || ''}
                  onChange={(e) => updateSet(exerciseId, set.id, 'weight_kg', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-[#03030a] border border-slate-700 focus:border-amber-400 text-center text-white font-mono font-black text-lg sm:text-xl py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/40 shadow-inner"
                />
                {set.previous_history && (
                  <div className="absolute bottom-0 left-0 w-full text-center">
                    <span className="text-[9px] text-slate-500 whitespace-nowrap font-mono">
                      (Trc: {set.previous_history.weight_kg}kg)
                    </span>
                  </div>
                )}
              </div>

              {/* Reps Input & Live 1RM Badge */}
              <div className="col-span-4 relative pb-4">
                <input
                  type="number"
                  inputMode="decimal"
                  enterKeyHint="next"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const formElements = Array.from(document.querySelectorAll('input, button'));
                      const index = formElements.indexOf(e.currentTarget);
                      if (index > -1 && index + 1 < formElements.length) {
                         (formElements[index + 1] as HTMLElement).focus();
                      }
                    }
                  }}
                  value={set.reps || ''}
                  onChange={(e) => updateSet(exerciseId, set.id, 'reps', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-[#03030a] border border-slate-700 focus:border-amber-400 text-center text-white font-mono font-black text-lg sm:text-xl py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/40 shadow-inner"
                />
                {set.previous_history && (
                  <div className="absolute bottom-0 left-0 w-full text-center">
                    <span className="text-[9px] text-slate-500 whitespace-nowrap font-mono">
                      (Trc: {set.previous_history.reps} reps)
                    </span>
                  </div>
                )}
                {estimated1RM > 0 && (
                  <span className="absolute right-0 top-0 -mt-1.5 -mr-1 text-[8px] font-mono font-bold text-amber-400 bg-slate-900/90 px-1 rounded border border-amber-400/30 whitespace-nowrap z-10">
                    1RM: {estimated1RM}
                  </span>
                )}
              </div>

              {/* Check Box */}
              <div className="col-span-2 flex justify-center items-center gap-1">
                <motion.button
                  aria-label={set.is_completed ? "Bỏ hoàn thành set" : "Hoàn thành set"}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleSetToggle(set.id, set.is_completed, set.weight_kg, set.reps)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                    set.is_completed
                      ? 'btn-aura-gold scale-105 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  <Check className={`w-6 h-6 sm:w-7 sm:h-7 ${set.is_completed ? 'stroke-[3]' : 'stroke-[2]'}`} />
                </motion.button>
                <button
                  aria-label="Xóa set"
                  onClick={() => {
                    removeSet(exerciseId, set.id)
                    useToastStore.getState().addToast({
                      variant: 'info',
                      title: 'Đã xóa Set',
                      duration: 5000,
                      action: {
                        label: 'HOÀN TÁC',
                        onClick: () => undoLastAction()
                      }
                    })
                  }}
                  className="p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Xóa set"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
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
})
