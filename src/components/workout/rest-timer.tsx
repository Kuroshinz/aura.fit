'use client'

import { useState, useEffect, useRef } from 'react'
import { Timer, Play, Pause, RotateCcw, X, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkoutStore } from '@/store/use-workout-store'

const PRESETS = [45, 60, 90, 120, 180]
const CIRCUMFERENCE = 2 * Math.PI * 36 // r=36

export function RestTimer() {
  const { restTimerSeconds, isRestTimerRunning, setRestTimer, startRestTimer, pauseRestTimer, resetRestTimer, tickRestTimer } =
    useWorkoutStore()

  const [soundEnabled, setSoundEnabled] = useState(true)
  const totalSecondsRef = useRef(restTimerSeconds)
  const progressRef = useRef(0)

  // Safe time calculation
  const validSeconds = typeof restTimerSeconds === 'number' && !isNaN(restTimerSeconds) ? restTimerSeconds : 60

  // Track total starting seconds for progress
  useEffect(() => {
    if (!isRestTimerRunning) {
      totalSecondsRef.current = validSeconds
    }
  }, [validSeconds, isRestTimerRunning])

  const progress = totalSecondsRef.current > 0
    ? (validSeconds / totalSecondsRef.current)
    : 1

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

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)
  // Color transitions: full â†’ warning â†’ danger
  const ringColor = progress > 0.5
    ? '#fbbf24'
    : progress > 0.25
    ? '#f59e0b'
    : '#ef4444'

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
        className="fixed bottom-20 right-2 sm:bottom-24 sm:right-6 z-[100] bg-[#070714]/95 rounded-full px-3 py-2 sm:px-5 sm:py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-amber-400/50 flex items-center gap-2 sm:gap-5 cursor-grab active:cursor-grabbing backdrop-blur-xl scale-90 sm:scale-100 origin-bottom-right"
      >
        <div className="flex items-center gap-3">
          {/* Circular Progress SVG */}
          <div className="relative w-12 h-12 sm:w-[60px] sm:h-[60px] shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              {/* Background ring */}
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="4"
              />
              {/* Progress ring */}
              <motion.circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke={ringColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="drop-shadow-[0_0_6px_var(--ring-color)]"
                style={
                  { '--ring-color': ringColor } as React.CSSProperties
                }
              />
            </svg>
            {/* Time text centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-pulse pointer-events-none" />
            </div>
          </div>

          <div className="font-mono text-xl sm:text-2xl font-extrabold text-white tracking-wider gold-gradient-text min-w-[60px] sm:min-w-[75px] pointer-events-none select-none">
            {formatTime(validSeconds)}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3 border-l border-slate-700/80 pl-2 sm:pl-5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full transition-colors touch-target ${
              soundEnabled ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:bg-slate-800'
            }`}
            aria-label={soundEnabled ? 'Mute timer' : 'Enable sound'}
          >
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {isRestTimerRunning ? (
            <button
              onClick={pauseRestTimer}
              className="p-2.5 bg-amber-500 text-black rounded-full hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 touch-target"
              aria-label="Pause timer"
            >
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>
          ) : (
            <button
              onClick={startRestTimer}
              className="p-2.5 btn-aura-gold rounded-full touch-target"
              aria-label="Start timer"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
            </button>
          )}

          <button
            onClick={() => setRestTimer(validSeconds + 30)}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50 rounded-full transition-colors touch-target"
          >
            +30s
          </button>

          <button
            onClick={resetRestTimer}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors touch-target"
            aria-label="Close timer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

