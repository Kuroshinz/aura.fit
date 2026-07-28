'use client'

import { useState, useMemo } from 'react'
import { useWorkoutStore } from '@/store/use-workout-store'
import { Sparkles, BrainCircuit, Zap, ArrowRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function GlobalAICoach() {
  const { workoutHistory } = useWorkoutStore()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const analysis = useMemo(() => {
    if (!workoutHistory || workoutHistory.length === 0) {
      return {
        status: 'WELCOME',
        message: 'Chào mừng bạn đến với AURA! Hãy bắt đầu ghi nhận buổi tập đầu tiên để AI có thể phân tích dữ liệu cơ thể của bạn.',
        suggestion: 'Khởi động với một buổi Full Body nhẹ nhàng.',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-400/30'
      }
    }

    const latestWorkout = workoutHistory[0]
    const latestDate = new Date(latestWorkout.start_time)
    const hoursSinceLastWorkout = (Date.now() - latestDate.getTime()) / (1000 * 60 * 60)

    // Calculate total volume over last 7 days
    const last7Days = workoutHistory.filter(w => (Date.now() - new Date(w.start_time).getTime()) / (1000 * 60 * 60 * 24) <= 7)
    const prev7Days = workoutHistory.filter(w => {
      const days = (Date.now() - new Date(w.start_time).getTime()) / (1000 * 60 * 60 * 24)
      return days > 7 && days <= 14
    })

    const vol7 = last7Days.reduce((sum, w) => sum + w.total_volume, 0)
    const prevVol7 = prev7Days.reduce((sum, w) => sum + w.total_volume, 0)
    const volTrend = prevVol7 > 0 ? ((vol7 - prevVol7) / prevVol7) * 100 : 0

    let fatiguedMuscles = new Set<string>()
    if (hoursSinceLastWorkout < 48) {
      latestWorkout.exercises.forEach(ex => fatiguedMuscles.add(ex.muscle_group.toUpperCase()))
    }

    if (hoursSinceLastWorkout < 12) {
      return {
        status: 'RECOVERY_MODE',
        message: `Bạn vừa hoàn thành buổi tập "${latestWorkout.routine_name}" cách đây ${Math.round(hoursSinceLastWorkout)} tiếng. Cơ bắp (${Array.from(fatiguedMuscles).join(', ')}) đang trong giai đoạn tổng hợp Protein.`,
        suggestion: 'Hôm nay là ngày nghỉ (Rest Day). Ưu tiên nạp đủ đạm (Protein) và ngủ đủ 8 tiếng.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-400/30'
      }
    }

    if (hoursSinceLastWorkout > 120) { // 5 days
      return {
        status: 'INACTIVE',
        message: `Đã ${Math.floor(hoursSinceLastWorkout / 24)} ngày bạn chưa tập luyện. Sự nhất quán là chìa khóa để thay đổi hình thể!`,
        suggestion: 'Hãy quay lại phòng gym ngay hôm nay. Khuyên dùng giáo án Full Body để đánh thức cơ bắp.',
        color: 'text-red-400',
        bg: 'bg-red-500/10 border-red-400/30'
      }
    }

    if (volTrend > 15) {
      return {
        status: 'OVERREACHING',
        message: `Khối lượng tạ (Volume) tuần này của bạn tăng vọt +${volTrend.toFixed(1)}% so với tuần trước. Bạn đang vượt ngưỡng!`,
        suggestion: 'Cẩn thận với chấn thương CNS. Hãy xem xét giảm nhẹ tạ (Deload) vào buổi tiếp theo nếu thấy đau mỏi.',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 border-rose-400/30'
      }
    }

    return {
      status: 'OPTIMAL',
      message: `Cơ thể bạn đang phục hồi tốt. Lần cuối tập là ${Math.floor(hoursSinceLastWorkout / 24)} ngày trước (${latestWorkout.routine_name}).`,
      suggestion: 'Sẵn sàng cho buổi tập tiếp theo. Cố gắng phá kỷ lục (PR) của chính bạn ở bài tập đầu tiên (Compound)!',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-400/30'
    }
  }, [workoutHistory])

  // Don't show the floating button on the active workout screen so it doesn't distract
  if (pathname === '/workout' && !isOpen) return null

  return (
    <>
      {/* Floating Action Button (Draggable & Futuristic) */}
      {!isOpen && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, cursor: "grabbing" }}
          style={{ position: 'fixed', bottom: 100, right: 24, zIndex: 50, touchAction: 'none' }}
          className="cursor-grab flex flex-col items-center justify-center group"
        >
          <div className="relative w-16 h-16 rounded-full flex items-center justify-center">
            {/* Spinning futuristic borders */}
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 border-t-amber-400 border-r-amber-400 animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-1 rounded-full border border-cyan-500/20 border-b-cyan-400 animate-[spin_4s_linear_infinite_reverse]" />
            
            {/* Pulsing energy core */}
            <div className="absolute inset-2 bg-gradient-to-br from-amber-500/40 to-indigo-600/40 rounded-full animate-pulse blur-sm" />
            
            {/* Main Interactive Button */}
            <button 
              onClick={() => setIsOpen(true)}
              className="relative z-10 w-12 h-12 bg-[#030308] border border-amber-400/50 rounded-full flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] group-hover:shadow-[0_0_30px_rgba(251,191,36,0.8)] transition-all"
            >
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </button>
          </div>
          <span className="mt-2 text-[10px] font-mono font-bold text-amber-400/80 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-md pointer-events-none select-none border border-white/5">
            AURA AI
          </span>
        </motion.div>
      )}

      {/* Overlay Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`w-full max-w-lg rounded-3xl p-6 md:p-8 border ${analysis.bg} bg-[#030308]/95 shadow-2xl relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
              
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors z-20"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl">
                    <BrainCircuit className={`w-8 h-8 ${analysis.color}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
                      AURA AI COACH <Sparkles className="w-5 h-5 text-amber-400" />
                    </h3>
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${analysis.color}`}>
                      Tình trạng: {analysis.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-5">
                  <p className="text-base text-slate-200 leading-relaxed font-medium">
                    {analysis.message}
                  </p>
                  
                  <div className="p-5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl flex items-start gap-3">
                    <Zap className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">GỢI Ý TỪ AI</span>
                      <p className="text-base font-bold text-white leading-relaxed">{analysis.suggestion}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button onClick={() => setIsOpen(false)} className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">
                    ĐÓNG
                  </button>
                  <Link href="/routines" onClick={() => setIsOpen(false)} className="flex-1 py-3.5 btn-aura-gold text-black font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all">
                    ĐẾN LỊCH TẬP <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
