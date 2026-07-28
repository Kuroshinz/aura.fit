'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { VolumeChart } from '@/components/dashboard/volume-chart'
const HumanBodyHeatmap = dynamic(() => import('@/components/dashboard/human-body-heatmap').then(m => m.HumanBodyHeatmap), { ssr: false, loading: () => <div className="h-[400px] w-full animate-pulse bg-slate-900/50 rounded-3xl"></div> })
const ExerciseProgressChart = dynamic(() => import('@/components/dashboard/exercise-progress-chart').then(m => m.ExerciseProgressChart), { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-slate-900/50 rounded-3xl"></div> })
import { BodyMetricsTracker } from '@/components/dashboard/body-metrics-tracker'

import { SpatialCard } from '@/components/effects/spatial-card'
import { exportWorkoutDataCSV } from '@/lib/utils/export-data'
import { useWorkoutStore } from '@/store/use-workout-store'
import { useProfileStore, goalLabels } from '@/store/use-profile-store'
import { sendTelegramWebhook } from '@/lib/telegram-webhook'
import { Dumbbell, Flame, Trophy, Calendar, Sparkles, TrendingUp, Star, Clock, StickyNote, Download, Send, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function DashboardPage() {
  const { workoutHistory } = useWorkoutStore()
  const { profile } = useProfileStore()
  const [sendingTelegramId, setSendingTelegramId] = useState<string | null>(null)
  const [telegramToast, setTelegramToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<string[]>([]);

  const toggleHistoryExpand = (id: string) => {
    setExpandedHistoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Computed stats from real history
  const thisWeekWorkouts = workoutHistory.filter((w) => {
    const wDate = new Date(w.start_time)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return wDate >= weekAgo
  })

  const weeklyVolume = thisWeekWorkouts.reduce((sum, w) => sum + w.total_volume, 0)
  const weeklyCount = thisWeekWorkouts.length

  // Best 1RM from all history (Bench Press as example)
  const best1RM = workoutHistory.reduce((best, w) => {
    w.exercises.forEach((ex) => {
      ex.sets.filter((s) => s.is_completed).forEach((s) => {
        const estimated = Math.round(s.weight_kg * (1 + s.reps / 30))
        if (estimated > best) best = estimated
      })
    })
    return best
  }, 0)

  // Streak calculation
  const streak = (() => {
    if (workoutHistory.length === 0) return 0
    let count = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const hasWorkout = workoutHistory.some((w) => {
        const wDate = new Date(w.start_time)
        return wDate.toDateString() === checkDate.toDateString()
      })
      if (hasWorkout) count++
      else if (i > 0) break // allow today to be missing
    }
    return count
  })()

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* CLEAN DASHBOARD HEADER BLOCK */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          {profile ? (
            <>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 fill-current text-amber-400" />
                Chào {profile.name}, {profile.age} tuổi — Mục tiêu: {goalLabels[profile.goal]} — {profile.weight_kg} kg
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                <span className="gold-gradient-text">DASHBOARD</span>
              </h1>
            </>
          ) : (
            <>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 fill-current text-amber-400" />
                ATHLETIC ANALYTICS &amp; BODY MONITORING
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                <span className="gold-gradient-text">DASHBOARD</span>
              </h1>
            </>
          )}
        </div>
        <button
          onClick={exportWorkoutDataCSV}
          className="aura-glass px-5 py-3 rounded-2xl flex items-center gap-2 font-mono text-xs font-bold text-amber-300 border-amber-400/50 hover:bg-amber-400/10 transition-all shadow-xl self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-amber-400" />
          XUẤT FILE CSV SAO LƯU
        </button>
      </motion.div>

      {/* Glow Divider */}
      <div className="glow-divider" />

      {/* Spatial Luxury Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <motion.div whileHover={{ y: -5 }} className="h-full">
          <SpatialCard className="p-4 sm:p-6 rounded-3xl relative overflow-hidden group h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">BUỔI TẬP TUẦN</span>
              <div className="p-3 bg-amber-500/20 border border-amber-400 rounded-2xl text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{weeklyCount} <span className="text-xs font-sans text-slate-400 font-normal">Buổi</span></p>
            <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-emerald-400 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{workoutHistory.length} buổi tổng cộng</span>
            </div>
          </SpatialCard>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="h-full">
          <SpatialCard className="p-4 sm:p-6 rounded-3xl relative overflow-hidden group h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">VOLUME TUẦN</span>
              <div className="p-3 bg-indigo-500/20 border border-indigo-400 rounded-2xl text-indigo-300">
                <Dumbbell className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{weeklyVolume > 1000 ? `${(weeklyVolume / 1000).toFixed(1)}k` : weeklyVolume} <span className="text-xs font-sans text-slate-400 font-normal">Kg</span></p>
            <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-indigo-300 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{weeklyVolume > 0 ? 'Active Mode' : 'Chưa có dữ liệu'}</span>
            </div>
          </SpatialCard>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="h-full">
          <SpatialCard className="p-4 sm:p-6 rounded-3xl relative overflow-hidden group h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">BEST 1RM</span>
              <div className="p-3 bg-cyan-500/20 border border-cyan-400 rounded-2xl text-cyan-300">
                <Trophy className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{best1RM || '--'} <span className="text-xs font-sans text-slate-400 font-normal">Kg</span></p>
            <div className="mt-3 text-[11px] font-mono text-slate-300 font-bold">
              <span>Ước tính Epley Formula</span>
            </div>
          </SpatialCard>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="h-full">
          <SpatialCard className="p-4 sm:p-6 rounded-3xl relative overflow-hidden group h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">CHUỖI STREAK</span>
              <div className="p-3 bg-emerald-500/20 border border-emerald-400 rounded-2xl text-emerald-300">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{streak} <span className="text-xs font-sans text-slate-400 font-normal">Ngày</span></p>
            <div className="mt-3 text-[11px] font-mono text-emerald-400 font-bold">
              <span>{streak > 0 ? 'Duy trì kỷ luật tốt' : 'Bắt đầu tập nào!'}</span>
            </div>
          </SpatialCard>
        </motion.div>
      </motion.div>

      {/* Body Metrics & Weight Tracker */}
      <motion.div variants={itemVariants}>
        <BodyMetricsTracker />
      </motion.div>

      {/* SVG Human Body Muscle Heatmap */}
      <motion.div variants={itemVariants}>
        <HumanBodyHeatmap />
      </motion.div>

      {/* Per-Exercise Progress Chart */}
      <motion.div variants={itemVariants}>
        <ExerciseProgressChart />
      </motion.div>

      {/* Total Volume Weekly Chart */}
      <motion.div variants={itemVariants}>
        
              <VolumeChart />
      </motion.div>

      {/* Real Workout History Log List */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-400" />
            LỊCH SỬ CÁC BUỔI TẬP
          </h2>
        </div>

        {telegramToast && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-mono transition-all ${
            telegramToast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/10 border-red-500/40 text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              {telegramToast.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{telegramToast.msg}</span>
            </div>
            <button onClick={() => setTelegramToast(null)} className="text-xs font-bold hover:underline opacity-80">
              Đóng
            </button>
          </div>
        )}

        {workoutHistory.length === 0 ? (
          <div className="aura-glass rounded-3xl p-8 text-center border-dashed border-slate-700">
            <Dumbbell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-sans">Chưa có buổi tập nào được ghi nhận. Hãy bắt đầu buổi tập đầu tiên!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {workoutHistory.slice(0, 10).map((w) => {
              const dateObj = new Date(w.start_time)
              const dateStr = `${dateObj.toLocaleDateString('vi-VN', { weekday: 'long' })}, ${dateObj.toLocaleDateString('vi-VN')}`

              return (
                <motion.div 
                  key={w.id} 
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="aura-glass rounded-3xl p-6 md:p-8 space-y-6 border-slate-700 hover:border-amber-500/50 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase">{dateStr}</span>
                      <h3 className="text-xl font-extrabold text-white mt-0.5">{w.routine_name}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                      <span className="px-3 py-1.5 bg-slate-900 text-slate-200 border border-slate-700 rounded-xl font-bold">
                        ⏱️ {w.duration_minutes} phút
                      </span>
                      <span className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-xl font-bold">
                        🔥 Volume: {w.total_volume.toLocaleString()} kg
                      </span>
                      <button
                        onClick={async () => {
                          setSendingTelegramId(w.id)
                          setTelegramToast(null)
                          const res = await sendTelegramWebhook({
                            event_type: 'workout_completed',
                            user_email: `${(profile?.name || 'athlete').toLowerCase().replace(/\s+/g, '')}@aura.fit`,
                            user_name: profile?.name || 'Vận động viên AURA',
                            title: `📊 BÁO CÁO BUỔI TẬP: ${w.routine_name}`,
                            message: `Buổi tập ${w.routine_name} (${dateStr}) với tổng volume ${w.total_volume.toLocaleString()} kg trong ${w.duration_minutes} phút.`,
                            telegram_chat_id: profile?.telegram_chat_id || undefined,
                            metrics: {
                              'Ngày tập': dateStr,
                              'Tổng Volume': `${w.total_volume.toLocaleString()} kg`,
                              'Thời gian': `${w.duration_minutes} phút`,
                              'Số bài tập': w.exercises.length
                            }
                          })
                          setSendingTelegramId(null)
                          if (res.success) {
                            setTelegramToast({ type: 'success', msg: `Đã gửi báo cáo buổi tập "${w.routine_name}" tới Telegram!` })
                          } else {
                            setTelegramToast({ type: 'error', msg: res.error || 'Lỗi khi gửi báo cáo' })
                          }
                        }}
                        disabled={sendingTelegramId === w.id}
                        className="px-3.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {sendingTelegramId === w.id ? 'ĐANG GỬI...' : 'GỬI TELEGRAM'}
                      </button>
                    </div>
                  </div>

                  {/* Workout Exercises Detail */}
                  <div className="flex justify-center mt-2">
                    <button onClick={() => toggleHistoryExpand(w.id)} className="px-6 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-full text-xs font-mono font-bold text-amber-400 flex items-center gap-2 transition-all">
                      {expandedHistoryIds.includes(w.id) ? (
                        <><ChevronUp className="w-4 h-4" /> ẨN CHI TIẾT BÀI TẬP</>
                      ) : (
                        <><ChevronDown className="w-4 h-4" /> XEM CHI TIẾT BÀI TẬP</>
                      )}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {expandedHistoryIds.includes(w.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-slate-800 pt-6 mt-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {w.exercises.map((ex, eIdx) => (
                            <div key={eIdx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-full uppercase text-amber-400">
                                {ex.muscle_group}
                              </span>
                              <h4 className="font-bold text-white text-base mt-2 mb-1">{ex.exercise_name}</h4>
                              <div className="space-y-1">
                                {ex.sets.map((set, sIdx) => (
                                  <div key={set.id} className="flex justify-between text-xs text-slate-400 font-mono">
                                    <span>Set {sIdx + 1}: {set.weight_kg}kg x {set.reps} reps</span>
                                    {set.is_completed && <span className="text-emerald-400 font-bold">✓ Hoàn thành</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
