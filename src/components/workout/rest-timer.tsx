'use client'

import { useState, useEffect } from 'react'
import { Timer, Play, Pause, RotateCcw, X, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkoutStore } from '@/store/use-workout-store'

const PRESETS = [45, 60, 90, 120, 180]

export function RestTimer() {
  const { restTimerSeconds, isRestTimerRunning, setRestTimer, startRestTimer, pauseRestTimer, resetRestTimer, tickRestTimer } =
    useWorkoutStore()

  const [soundEnabled, setSoundEnabled] = useState(true)

  // Safe time calculation to avoid NaN:NaN
  const validSeconds = typeof restTimerSeconds === 'number' && !isNaN(restTimerSeconds) ? restTimerSeconds : 60

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, audioCtx.currentTime)
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.3)
    } catch (e) {
      // Audio fallback
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRestTimerRunning && validSeconds > 0) {
      interval = setInterval(() => {
        tickRestTimer()
      }, 1000)
    } else if (validSeconds === 0 && isRestTimerRunning) {
      if (soundEnabled) playBeep()
      pauseRestTimer()
    }
    return () => clearInterval(interval)
  }, [isRestTimerRunning, validSeconds])

  if (validSeconds === 0 && !isRestTimerRunning) return null

  const formatTime = (totalSec: number) => {
    const safeSec = Math.max(0, Math.floor(totalSec))
    const m = Math.floor(safeSec / 60)
    const s = safeSec % 60
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        whileDrag={{ scale: 1.05, cursor: "grabbing" }}
        className="fixed bottom-24 right-6 z-[100] bg-[#070714] bg-opacity-95 rounded-full px-5 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-amber-400/50 flex items-center gap-5 cursor-grab active:cursor-grabbing backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <Timer className="w-6 h-6 text-amber-400 animate-pulse pointer-events-none" />
          <div className="font-mono text-2xl font-extrabold text-white tracking-wider gold-gradient-text w-[75px] pointer-events-none select-none">
            {formatTime(validSeconds)}
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-700/80 pl-5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full transition-colors ${soundEnabled ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:bg-slate-800'}`}
          >
            <Volume2 className="w-5 h-5" />
          </button>
          
          {isRestTimerRunning ? (
            <button
              onClick={pauseRestTimer}
              className="p-2.5 bg-amber-500 text-black rounded-full hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              <Pause className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button
              onClick={startRestTimer}
              className="p-2.5 btn-aura-gold rounded-full"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
          )}

          <button
            onClick={() => setRestTimer(validSeconds + 30)}
            className="px-3 py-1.5 text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50 rounded-full transition-colors"
          >
            +30s
          </button>

          <button
            onClick={resetRestTimer}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
