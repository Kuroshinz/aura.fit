'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, CheckCircle2, Pause, Play, RotateCcw } from 'lucide-react'
import { useWorkoutStore } from '@/store/use-workout-store'

export function FloatingController({ onFinish }: { onFinish: () => void }) {
  const { 
    activeWorkout, 
    restTimerSeconds, 
    isRestTimerRunning, 
    tickRestTimer, 
    startRestTimer, 
    pauseRestTimer, 
    resetRestTimer,
    setRestTimer
  } = useWorkoutStore()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRestTimerRunning && restTimerSeconds > 0) {
      interval = setInterval(() => {
        tickRestTimer()
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRestTimerRunning, restTimerSeconds, tickRestTimer])

  if (!activeWorkout) return null

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-[85px] left-4 right-4 z-40 mx-auto max-w-md pointer-events-auto"
      >
        <div className="aura-glass bg-[#0c0e1e]/90 backdrop-blur-xl border border-amber-500/30 p-2 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center justify-between">
          
          {/* Rest Timer Module */}
          <div className="flex items-center gap-2 bg-[#03030a] rounded-full p-1.5 border border-slate-800 flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isRestTimerRunning ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-900 text-slate-400'}`}>
              <Timer className={`w-5 h-5 ${isRestTimerRunning ? 'animate-pulse' : ''}`} />
            </div>
            
            <div className="flex flex-col flex-1 px-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Nghỉ ngơi</span>
              <span className={`font-mono font-black text-lg leading-none ${isRestTimerRunning ? 'text-amber-400' : 'text-white'}`}>
                {formatTime(restTimerSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-1 pr-2">
              {isRestTimerRunning ? (
                <button onClick={pauseRestTimer} className="p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors">
                  <Pause className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button onClick={() => {
                  if (restTimerSeconds === 0) setRestTimer(60)
                  startRestTimer()
                }} className="p-2 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors">
                  <Play className="w-4 h-4 fill-current" />
                </button>
              )}
              <button onClick={resetRestTimer} className="p-2 rounded-full text-slate-500 hover:text-slate-300 transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Finish Button */}
          <button 
            onClick={onFinish}
            className="ml-2 h-[52px] px-5 rounded-[1.5rem] btn-aura-gold text-black font-display font-black text-xs tracking-widest uppercase flex items-center gap-2 shrink-0"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[3]" />
            Xong
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
