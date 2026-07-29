'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Dumbbell, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react'
import type { Exercise } from '@/data/exercises-database'

interface ExerciseDetailModalProps {
  exercise: Exercise | null
  onClose: () => void
}

export function ExerciseDetailModal({ exercise, onClose }: ExerciseDetailModalProps) {
  if (!exercise) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="aura-glass w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border-slate-700 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 border border-amber-400 rounded-xl text-amber-400">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{exercise.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full uppercase">
                    {exercise.muscleGroup}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-full uppercase">
                    {exercise.equipment || 'No Equipment'}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Media Header (Optional) */}
          {(exercise.metadata?.videoUrl || exercise.metadata?.thumbnailUrl) && (
            <div className="w-full bg-slate-900 border-b border-slate-800 flex justify-center py-4 px-6 overflow-hidden">
              {exercise.metadata?.videoUrl ? (
                <img 
                  src={exercise.metadata.videoUrl} 
                  alt={exercise.name} 
                  className="max-h-[30vh] w-auto object-contain rounded-xl shadow-lg border border-slate-700/50"
                  loading="lazy"
                />
              ) : (
                <img 
                  src={exercise.metadata?.thumbnailUrl} 
                  alt={exercise.name} 
                  className="max-h-[30vh] w-auto object-contain rounded-xl shadow-lg border border-slate-700/50"
                  loading="lazy"
                />
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
            
            {/* Metadata Tags */}
            <div className="flex flex-wrap gap-2">
              {exercise.difficulty && (
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-mono font-bold">
                  Khó: {exercise.difficulty}
                </span>
              )}
              {exercise.metadata?.musclesWorked?.secondary && exercise.metadata.musclesWorked.secondary.length > 0 && (
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-mono font-bold">
                  Phụ: {exercise.metadata.musclesWorked.secondary.join(', ')}
                </span>
              )}
            </div>

            {/* Instructions */}
            {exercise.metadata?.instructions && exercise.metadata.instructions.length > 0 && (
              <div>
                <h4 className="text-sm font-black text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Hướng Dẫn Kỹ Thuật
                </h4>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-300 font-medium">
                  {exercise.metadata.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Tips */}
            {exercise.metadata?.tips && exercise.metadata.tips.length > 0 && (
              <div>
                <h4 className="text-sm font-black text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Tips (Mẹo)
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-amber-400/80 font-medium">
                  {exercise.metadata.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Common Mistakes */}
            {exercise.metadata?.commonMistakes && exercise.metadata.commonMistakes.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                <h4 className="text-sm font-black text-red-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" /> Sai Lầm Thường Gặp
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-sm text-red-300/80 font-medium">
                  {exercise.metadata.commonMistakes.map((mistake, idx) => (
                    <li key={idx}>{mistake}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
