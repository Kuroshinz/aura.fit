'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, CheckCircle2, Pause, Play, RotateCcw, X, Volume2 } from 'lucide-react'
import { useWorkoutStore } from '@/store/use-workout-store'

const CIRCUMFERENCE = 2 * Math.PI * 24 // r=24 for a slightly smaller circle in the floating controller

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

  const [soundEnabled, setSoundEnabled] = useState(true)
  const validSeconds = typeof restTimerSeconds === 'number' && !isNaN(restTimerSeconds) ? restTimerSeconds : 60
  const totalSecondsRef = useRef(validSeconds)

  useEffect(() => {
    if (!isRestTimerRunning) {
      totalSecondsRef.current = validSeconds
    }
  }, [validSeconds, isRestTimerRunning])

  const progress = totalSecondsRef.current > 0
    ? (validSeconds / totalSecondsRef.current)
    : 1

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRestTimerRunning && validSeconds > 0) {
      interval = setInterval(() => {
        tickRestTimer()
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRestTimerRunning, validSeconds, tickRestTimer])

  // Audio & Vibration when Timer ends
  useEffect(() => {
    if (validSeconds === 0 && isRestTimerRunning) {
      const playBeep = () => {
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContext) return;
          const ctx = new AudioContext();
          
          // Play 3 short beeps
          for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime + i * 0.4);
            
            gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.4);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.4 + 0.2);
            
            osc.start(ctx.currentTime + i * 0.4);
            osc.stop(ctx.currentTime + i * 0.4 + 0.2);
          }
          
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
          }
        } catch (e) {
          console.error('Audio playback failed', e);
        }
      }
      if (soundEnabled) playBeep()
      pauseRestTimer() // Mark timer inactive after beep
    }
  }, [validSeconds, isRestTimerRunning, pauseRestTimer, soundEnabled])

  if (!activeWorkout) return null

  const formatTime = (totalSec: number) => {
    const safeSec = Math.max(0, Math.floor(totalSec))
    const m = Math.floor(safeSec / 60)
    const s = safeSec % 60
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
  }

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)
  const ringColor = progress > 0.5 ? '#fbbf24' : progress > 0.25 ? '#f59e0b' : '#ef4444'

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
          <div className="flex items-center gap-2 sm:gap-3 bg-[#03030a] rounded-full p-2 border border-slate-800 flex-1">
            
            <div className="relative w-10 h-10 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                <motion.circle
                  cx="28" cy="28" r="24" fill="none"
                  stroke={ringColor} strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE} strokeDashoffset={strokeDashoffset}
                  animate={{ strokeDashoffset }} transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="drop-shadow-[0_0_4px_var(--ring-color)]"
                  style={{ '--ring-color': ringColor } as React.CSSProperties}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Timer className="w-4 h-4 text-amber-400 animate-pulse pointer-events-none" />
              </div>
            </div>
            
            <div className="font-mono text-xl font-extrabold text-white tracking-wider gold-gradient-text min-w-[55px] pointer-events-none select-none">
              {formatTime(validSeconds)}
            </div>

            <div className="flex items-center gap-1 sm:gap-2 border-l border-slate-700/80 pl-2 sm:pl-3">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                  soundEnabled ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:bg-slate-800'
                }`}
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {isRestTimerRunning ? (
                <button onClick={pauseRestTimer} className="p-2 sm:p-2.5 bg-amber-500 text-black rounded-full hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                </button>
              ) : (
                <button onClick={() => {
                  if (validSeconds === 0) setRestTimer(60)
                  startRestTimer()
                }} className="p-2 sm:p-2.5 btn-aura-gold rounded-full">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                </button>
              )}

              <button
                onClick={() => setRestTimer(validSeconds + 30)}
                className="px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50 rounded-full transition-colors"
              >
                +30s
              </button>

              <button onClick={resetRestTimer} className="p-1.5 rounded-full text-slate-500 hover:text-slate-300 transition-colors hidden sm:block">
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
