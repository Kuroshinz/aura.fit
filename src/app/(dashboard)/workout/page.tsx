'use client'

import { useState, useEffect, useMemo } from 'react'
import { useWorkoutStore } from '@/store/use-workout-store'
import { useProfileStore } from '@/store/use-profile-store'
import { ExerciseLogCard } from '@/components/workout/exercise-log-card'
import { calculateTotalVolume } from '@/lib/utils/workout-math'
import { sendTelegramWebhook } from '@/lib/telegram-webhook'
import { Dumbbell, Play, CheckCircle2, Plus, Flame, Sparkles, Activity, Search, X, Clock, Trophy, Zap, ArrowRight, RefreshCw, Cloud, CloudOff, CloudUpload } from 'lucide-react'
import { useToastStore } from '@/components/effects/toast'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

const allExercises = [
  { id: '1', name: 'Bench Press', muscle: 'Chest' },
  { id: '2', name: 'Incline Dumbbell Press', muscle: 'Chest' },
  { id: '3', name: 'Machine Chest Press', muscle: 'Chest' },
  { id: '4', name: 'Pec Deck (Ép Ngực)', muscle: 'Chest' },
  { id: '5', name: 'Cable Fly', muscle: 'Chest' },
  { id: '6', name: 'Lat Pulldown', muscle: 'Back' },
  { id: '7', name: 'Barbell Row', muscle: 'Back' },
  { id: '8', name: 'Chest Supported Row', muscle: 'Back' },
  { id: '9', name: 'Seated Cable Row', muscle: 'Back' },
  { id: '10', name: 'T-Bar Row', muscle: 'Back' },
  { id: '11', name: 'Face Pull', muscle: 'Back' },
  { id: '12', name: 'Barbell Squat', muscle: 'Legs' },
  { id: '13', name: 'Leg Press', muscle: 'Legs' },
  { id: '14', name: 'Hack Squat', muscle: 'Legs' },
  { id: '15', name: 'Romanian Deadlift', muscle: 'Legs' },
  { id: '16', name: 'Lying Leg Curl', muscle: 'Legs' },
  { id: '17', name: 'Leg Extension', muscle: 'Legs' },
  { id: '18', name: 'Hip Abduction Machine', muscle: 'Legs' },
  { id: '19', name: 'Standing Calf Raise', muscle: 'Legs' },
  { id: '20', name: 'Overhead Press', muscle: 'Shoulders' },
  { id: '21', name: 'Machine Shoulder Press', muscle: 'Shoulders' },
  { id: '22', name: 'Lateral Raise', muscle: 'Shoulders' },
  { id: '23', name: 'Rear Delt Fly', muscle: 'Shoulders' },
  { id: '24', name: 'Cable Lateral Raise', muscle: 'Shoulders' },
  { id: '25', name: 'Bicep Curl', muscle: 'Arms' },
  { id: '26', name: 'Rope Hammer Curl', muscle: 'Arms' },
  { id: '27', name: 'Cable Curl', muscle: 'Arms' },
  { id: '28', name: 'Tricep Pushdown', muscle: 'Arms' },
  { id: '29', name: 'Cable Tricep Extension', muscle: 'Arms' },
  { id: '30', name: 'Skull Crusher', muscle: 'Arms' },
  { id: '31', name: 'Cable Crunch', muscle: 'Core' },
  { id: '32', name: 'Hanging Leg Raise', muscle: 'Core' },
  { id: '33', name: 'Plank', muscle: 'Core' },
]

const muscleFilters = ['TẤT CẢ', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core']

export default function WorkoutPage() {
  const { profile } = useProfileStore()
  const {
    activeWorkout,
    startWorkout,
    finishWorkout,
    addExerciseToWorkout,
    showSummary,
    lastCompletedWorkout,
    dismissSummary,
  } = useWorkoutStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('TẤT CẢ')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced')

  // Auto-Save UI Sync Listener
  useEffect(() => {
    const handleQueued = () => setSyncStatus('saving')
    const handleSuccess = () => setSyncStatus('synced')
    const handleOffline = () => setSyncStatus('offline')
    const handleOnline = () => setSyncStatus('saving') // it will flush shortly

    window.addEventListener('aura-sync-queued', handleQueued)
    window.addEventListener('aura-sync-success', handleSuccess)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSyncStatus('offline')
    }

    return () => {
      window.removeEventListener('aura-sync-queued', handleQueued)
      window.removeEventListener('aura-sync-success', handleSuccess)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  // Elapsed Timer
  useEffect(() => {
    if (!activeWorkout) {
      setElapsedSeconds(0)
      return
    }
    const startMs = new Date(activeWorkout.start_time).getTime()
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startMs) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [activeWorkout])

  const formatElapsed = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Filtered exercises for modal
  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      const matchSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchMuscle = muscleFilter === 'TẤT CẢ' || ex.muscle === muscleFilter
      return matchSearch && matchMuscle
    })
  }, [searchQuery, muscleFilter])

  // === WORKOUT SUMMARY RECAP SCREEN ===
  if (showSummary && lastCompletedWorkout) {
    // Fire celebration confetti
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#fbbf24', '#f59e0b', '#a855f7', '#38bdf8', '#10b981', '#ef4444'] })
      }, 300)
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/15 blur-[180px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 aura-glass rounded-3xl p-8 md:p-12 max-w-lg w-full space-y-8 border-amber-400/50"
        >
          <div className="p-6 bg-amber-500/20 border border-amber-400 rounded-3xl inline-block mx-auto">
            <Trophy className="w-16 h-16 text-amber-400" />
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight">
            BUỔI TẬP <span className="gold-gradient-text">HOÀN THÀNH!</span>
          </h1>

          <p className="text-sm font-mono text-slate-300">{lastCompletedWorkout.routine_name}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#070714] border border-slate-700">
              <Clock className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-white font-mono">{lastCompletedWorkout.duration_minutes}</p>
              <span className="text-[10px] font-mono text-slate-400 uppercase">PHÚT TẬP</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#070714] border border-slate-700">
              <Flame className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-white font-mono">{lastCompletedWorkout.total_volume.toLocaleString()}</p>
              <span className="text-[10px] font-mono text-slate-400 uppercase">KG VOLUME</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#070714] border border-slate-700">
              <Dumbbell className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-white font-mono">{lastCompletedWorkout.exercises_count}</p>
              <span className="text-[10px] font-mono text-slate-400 uppercase">BÀI TẬP</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#070714] border border-slate-700">
              <Zap className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-white font-mono">{lastCompletedWorkout.sets_completed}</p>
              <span className="text-[10px] font-mono text-slate-400 uppercase">SET HOÀN THÀNH</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => {
                const rId = lastCompletedWorkout.routine_id
                const rName = lastCompletedWorkout.routine_name
                const exercises = lastCompletedWorkout.exercises
                
                // Clean the finished session from history to prevent duplicate entries
                const cleanHistory = useWorkoutStore.getState().workoutHistory.filter(w => w.id !== lastCompletedWorkout.id)
                useWorkoutStore.setState({ workoutHistory: cleanHistory })
                const { syncStateToCloud } = require('@/lib/supabase/user-sync')
                syncStateToCloud({ workout_history: cleanHistory }, true)
                
                dismissSummary()
                startWorkout(rId, rName)
                
                // Add the exercises back immediately
                exercises.forEach((ex) => {
                  addExerciseToWorkout(ex.exercise_id, ex.exercise_name, ex.muscle_group)
                })
              }}
              className="flex-1 py-4 bg-slate-900 border border-slate-700 hover:border-amber-400 text-amber-400 font-display font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4 animate-spin-hover" />
              TẬP LẠI (RESTART)
            </button>
            <button
              onClick={dismissSummary}
              className="flex-1 py-4 btn-aura-gold text-black font-display font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-2xl"
            >
              VỀ TRANG CHỦ
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // === NO ACTIVE WORKOUT — START SCREEN ===
  if (!activeWorkout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[160px] rounded-full pointer-events-none" />

        <div className="p-10 aura-glass rounded-3xl mb-8 shadow-2xl relative z-10 animate-float border-amber-500/30">
          <Sparkles className="w-20 h-20 text-amber-400" />
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-4 tracking-tight">
          AURA <span className="gold-gradient-text">LIVE SESSION</span>
        </h1>
        <p className="text-slate-400 mb-12 max-w-lg font-sans text-base md:text-lg leading-relaxed">
          Ghi nhận thông số tập luyện tương lai với trải nghiệm thị giác Antigravity mượt mà.
        </p>

        <button
          onClick={() => startWorkout()}
          className="w-full sm:w-auto px-12 py-5 btn-aura-gold text-black font-display font-black text-base tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-2xl"
        >
          <Play className="w-5 h-5 fill-current" />
          KÍCH HOẠT BUỔI TẬP MỚI
        </button>
      </div>
    )
  }

  // === ACTIVE WORKOUT SESSION ===
  const allCompletedSets = activeWorkout.exercises.flatMap((e) => e.sets)
  const totalVolume = calculateTotalVolume(allCompletedSets)

  return (
    <div className="space-y-6">
      {/* Sticky Header Banner with Elapsed Timer */}
      <div className="aura-glass rounded-3xl p-6 sticky top-4 z-30 border-amber-500/30 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-display font-black text-white tracking-tight">
              {activeWorkout.routine_name}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-xs font-mono text-slate-400">
                VOLUME: <span className="font-extrabold text-amber-400 text-sm">{totalVolume.toLocaleString()} KG</span>
              </p>
              <p className="text-xs font-mono text-cyan-300 flex items-center gap-1 border-l border-slate-700 pl-4">
                <Clock className="w-3 h-3" />
                <span className="font-extrabold text-sm">{formatElapsed(elapsedSeconds)}</span>
              </p>
              <div className="flex items-center gap-1.5 border-l border-slate-700 pl-4">
                {syncStatus === 'synced' && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Cloud className="w-3 h-3" />
                    <span>SAVED</span>
                  </div>
                )}
                {syncStatus === 'saving' && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <CloudUpload className="w-3 h-3 animate-pulse" />
                    <span>SAVING...</span>
                  </div>
                )}
                {syncStatus === 'offline' && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    <CloudOff className="w-3 h-3" />
                    <span>OFFLINE - SAVED LOCALLY</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Hoàn thành buổi tập và lưu dữ liệu?')) {
              const vol = totalVolume
              const routineName = activeWorkout.routine_name
              const exCount = activeWorkout.exercises.length
              const setsCount = allCompletedSets.length
              const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60))

              finishWorkout()
              
              useToastStore.getState().addToast({
                variant: 'success',
                title: 'Hoàn thành buổi tập!',
                message: `Chúc mừng bạn đã hoàn thành xuất sắc buổi tập '${routineName}' ngày hôm nay!`
              })

              sendTelegramWebhook({
                event_type: 'workout_completed',
                user_email: `${(profile?.name || 'athlete').toLowerCase().replace(/\s+/g, '')}@aura.fit`,
                user_name: profile?.name || 'Vận động viên AURA',
                title: `🏋️ HOÀN THÀNH BUỔI TẬP: ${routineName}`,
                message: `Đã hoàn thành xuất sắc bài tập ${routineName} trong ${durationMinutes} phút với tổng volume ${vol.toLocaleString()} kg!`,
                telegram_chat_id: profile?.telegram_chat_id || undefined,
                metrics: {
                  'Tổng Volume': `${vol.toLocaleString()} kg`,
                  'Thời gian': `${durationMinutes} phút`,
                  'Số bài tập': exCount,
                  'Số Set hoàn thành': setsCount
                }
              })
            }
          }}
          className="px-6 py-3.5 btn-aura-gold text-black font-display font-black rounded-2xl text-xs uppercase tracking-widest flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          HOÀN THÀNH
        </button>
      </div>

      {/* Exercises List */}
      {activeWorkout.exercises.length === 0 ? (
        <div className="text-center py-20 aura-glass border-dashed border-slate-800 rounded-3xl">
          <Activity className="w-14 h-14 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-sans text-base mb-6">Chưa chọn bài tập nào cho buổi tập hiện tại.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-8 py-4 btn-aura-gold text-black font-display font-black rounded-2xl text-xs uppercase tracking-widest inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            CHỌN BÀI TẬP
          </button>
        </div>
      ) : (
        activeWorkout.exercises.map((ex) => (
          <ExerciseLogCard
            key={ex.exercise_id}
            exerciseId={ex.exercise_id}
            exerciseName={ex.exercise_name}
            muscleGroup={ex.muscle_group}
          />
        ))
      )}

      {/* Add Exercise Floating Action */}
      {activeWorkout.exercises.length > 0 && (
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-5 aura-glass hover:bg-slate-900 border-slate-800 text-amber-400 font-display font-black text-xs uppercase tracking-widest rounded-3xl flex items-center justify-center gap-2.5 transition-all shadow-2xl"
        >
          <Plus className="w-5 h-5" />
          THÊM BÀI TẬP KHÁC
        </button>
      )}

      {/* Add Exercise Modal with Search & Filter */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="aura-glass w-full max-w-lg rounded-3xl p-8 shadow-2xl border-slate-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">Chọn Bài Tập</h2>
                <button
                  onClick={() => { setShowAddModal(false); setSearchQuery(''); setMuscleFilter('TẤT CẢ'); }}
                  className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm bài tập... (VD: Bench, Squat)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#03030a] border border-slate-700 focus:border-amber-400 text-white font-mono text-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                />
              </div>

              {/* Muscle Group Filters */}
              <div className="flex flex-wrap gap-2 mb-5">
                {muscleFilters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setMuscleFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase border transition-all ${
                      muscleFilter === f
                        ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Exercise List */}
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto mb-6 pr-1">
                {filteredExercises.length === 0 ? (
                  <p className="text-center text-slate-500 font-mono text-sm py-8">Không tìm thấy bài tập nào.</p>
                ) : (
                  filteredExercises.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => {
                        addExerciseToWorkout(ex.id, ex.name, ex.muscle)
                        setShowAddModal(false)
                        setSearchQuery('')
                        setMuscleFilter('TẤT CẢ')
                      }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-[#070714] hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
                    >
                      <span className="font-display font-bold text-slate-200 group-hover:text-amber-400">{ex.name}</span>
                      <span className="text-[10px] font-mono font-bold px-3 py-1 bg-slate-900 text-amber-400 border border-amber-400/20 rounded-full uppercase">
                        {ex.muscle}
                      </span>
                    </button>
                  ))
                )}
              </div>

              <button
                onClick={() => { setShowAddModal(false); setSearchQuery(''); setMuscleFilter('TẤT CẢ'); }}
                className="w-full py-4 bg-slate-900 text-slate-300 font-display font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-colors"
              >
                HỦY BỎ
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
