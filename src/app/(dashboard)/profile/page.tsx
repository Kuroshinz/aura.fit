'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProfileStore, goalLabels, experienceLabels, UserProfile } from '@/store/use-profile-store'
import { SpatialCard } from '@/components/effects/spatial-card'
import { User, Scale, Ruler, Activity, Flame, Edit3, Save, RotateCcw, ShieldCheck, Zap, LogOut, Send, Bell, CheckCircle, AlertCircle, AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendTelegramWebhook } from '@/lib/telegram-webhook'
import { useWorkoutStore } from '@/store/use-workout-store'
import { exportWorkoutDataCSV } from '@/lib/utils/export-data'
import { resetAllUserData } from '@/lib/supabase/user-data-reset'

export default function ProfilePage() {
  const router = useRouter()
  const { profile, setProfile, resetProfile, logout } = useProfileStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)

  // Edit form states
  const [name, setName] = useState(profile?.name || 'Vận động viên')
  const [age, setAge] = useState(profile?.age?.toString() || '22')
  const [heightCm, setHeightCm] = useState(profile?.height_cm?.toString() || '175')
  const [weightKg, setWeightKg] = useState(profile?.weight_kg?.toString() || '72.5')
  const [bodyFat, setBodyFat] = useState(profile?.body_fat?.toString() || '17')
  const [goal, setGoal] = useState(profile?.goal || 'recomposition')
  const [experience, setExperience] = useState(profile?.experience || '1y-3y')
  const [telegramChatId, setTelegramChatId] = useState(profile?.telegram_chat_id || '')
  const [autoSendRoutine, setAutoSendRoutine] = useState(profile?.auto_send_routine ?? true)
  const [testingTelegram, setTestingTelegram] = useState(false)
  const [telegramTestStatus, setTelegramTestStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [telegramSaveStatus, setTelegramSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Danger Zone (Reset All Data) states
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [resetEmailInput, setResetEmailInput] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const [resetError, setResetError] = useState('')

  const currentProfile = profile || {
    name: 'Vận động viên AURA',
    age: 22,
    gender: 'male',
    height_cm: 175,
    weight_kg: 72.5,
    body_fat: 17,
    experience: '1y-3y',
    goal: 'recomposition',
    sessions_per_week: 5,
    telegram_chat_id: '',
  }

  // Calculations
  const heightM = currentProfile.height_cm / 100
  const bmi = (currentProfile.weight_kg / (heightM * heightM)).toFixed(1)
  
  // BMR (Mifflin-St Jeor)
  const bmr = Math.round(
    10 * currentProfile.weight_kg + 6.25 * currentProfile.height_cm - 5 * currentProfile.age + (currentProfile.gender === 'male' ? 5 : -161)
  )

  // TDEE estimate (Moderate activity 1.55)
  const tdee = Math.round(bmr * 1.55)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const updated: UserProfile = {
      ...currentProfile,
      name: name.trim(),
      age: parseInt(age) || 20,
      height_cm: parseFloat(heightCm) || 170,
      weight_kg: parseFloat(weightKg) || 70,
      body_fat: bodyFat ? parseFloat(bodyFat) : null,
      goal: goal as UserProfile['goal'],
      experience: experience as UserProfile['experience'],
      telegram_chat_id: telegramChatId.trim(),
      auto_send_routine: autoSendRoutine,
    }
    setProfile(updated)
    setIsEditing(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)

    // If Telegram settings changed, send confirmation notification
    if (telegramChatId.trim()) {
      // Detect @username — Telegram cannot DM user @usernames, only numeric IDs
      if (telegramChatId.trim().startsWith('@')) {
        setTelegramSaveStatus({ type: 'error', message: '❌ Không thể gửi tin nhắn qua @username! Vui lòng dùng lệnh /myid trên Telegram Bot để lấy Chat ID số.' })
        setTimeout(() => setTelegramSaveStatus(null), 8000)
        return
      }

      setTelegramSaveStatus({ type: 'success', message: 'Đang xác thực kết nối Telegram...' })
      const result = await sendTelegramWebhook({
        event_type: 'test_notification',
        user_email: `${updated.name.toLowerCase().replace(/\s+/g, '')}@aura.fit`,
        user_name: updated.name,
        title: '✅ CÀI ĐẶT TELEGRAM THÀNH CÔNG',
        message: `Cài đặt Telegram của bạn đã được lưu thành công! Bạn sẽ nhận được lịch tập hằng ngày lúc 7:00 AM.`,
        telegram_chat_id: telegramChatId.trim() || undefined,
        metrics: {
          'Tự động gửi lịch tập': autoSendRoutine ? 'BẬT (7:00 AM)' : 'TẮT'
        }
      })
      if (result.success) {
        setTelegramSaveStatus({ type: 'success', message: '✅ Đã lưu cài đặt Telegram và gửi tin nhắn xác nhận thành công!' })
      } else {
        setTelegramSaveStatus({ type: 'error', message: result.error || '⚠️ Đã lưu cài đặt nhưng không thể gửi tin nhắn xác nhận. Kiểm tra lại Chat ID!' })
      }
      setTimeout(() => setTelegramSaveStatus(null), 6000)
    }
  }

  const handleTestTelegramNotification = async () => {
    setTestingTelegram(true)
    setTelegramTestStatus(null)
    const result = await sendTelegramWebhook({
      event_type: 'test_notification',
      user_email: `${currentProfile.name.toLowerCase().replace(/\s+/g, '')}@aura.fit`,
      user_name: currentProfile.name,
      title: '⚡ THÔNG BÁO DÙNG THỬ AURA.FIT',
      message: `Chào mừng ${currentProfile.name}! Hệ thống thông báo Telegram Bot đã kết nối thành công với ứng dụng AURA.FIT Next.js!`,
      telegram_chat_id: telegramChatId || undefined,
      metrics: {
        'Cân nặng': `${currentProfile.weight_kg} kg`,
        'Mục tiêu': goalLabels[currentProfile.goal],
        'BMR': `${bmr} kcal`,
        'TDEE': `${tdee} kcal`
      }
    })

    setTestingTelegram(false)
    if (result.success) {
      setTelegramTestStatus({ type: 'success', message: 'Đã gửi thông báo thử tới Telegram thành công!' })
    } else {
      setTelegramTestStatus({ type: 'error', message: result.error || 'Lỗi khi gửi thông báo đến Telegram' })
    }
  }

  const handleReset = () => {
    if (confirm('Bạn có chắc muốn làm lại quy trình Onboarding hồ sơ mới?')) {
      resetProfile()
      router.push('/onboarding')
    }
  }

  // ─── Full reset (Danger Zone): wipe server + browser data, keep account ───
  const handleFullReset = async () => {
    if (!profile?.id) return
    const userEmail = profile.email || (currentProfile.name?.toLowerCase().replace(/\s+/g, '') + '@aura.fit')
    if (resetEmailInput.trim().toLowerCase() !== userEmail.toLowerCase()) {
      setResetError('Email xác nhận không khớp với email tài khoản của bạn!')
      return
    }

    setIsResetting(true)
    setResetError('')

    const result = await resetAllUserData(profile.id)
    if (!result.success) {
      setResetError(result.error || 'Lỗi không xác định khi xóa dữ liệu. Vui lòng thử lại.')
      setIsResetting(false)
      return
    }

    // Clear browser storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gym-user-profile-storage')
      localStorage.removeItem('gym-active-workout-storage')
      localStorage.removeItem('aura_custom_routine')
      localStorage.removeItem('aura_register_temp_name')
    }

    resetProfile()
    setResetModalOpen(false)
    router.push('/onboarding')
  }

  // ─── Get initials from name ────────────────────────────────────────
  function getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
            ATHLETE ATHLETICS CARD
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            HỒ SƠ CÁ NHÂN
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-5 py-3 aura-glass border-amber-400/50 text-amber-300 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl hover:bg-amber-400/10 transition-all"
          >
            {saveSuccess ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <Edit3 className="w-4 h-4 text-amber-400" />
            )}
            {saveSuccess ? 'ĐÃ LƯU THÀNH CÔNG' : (isEditing ? 'HỦY CHỈNH SỬA' : 'CHỈNH SỬA HỒ SƠ')}
          </button>

          <button
            onClick={() => {
              if (confirm('Bạn có chắc muốn đăng xuất tài khoản?')) {
                logout()
                router.push('/login')
              }
            }}
            className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 border border-red-500/40 transition-all shadow-xl"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">ĐĂNG XUẤT</span>
          </button>
        </div>
      </div>

      {/* Glow Divider */}
      <div className="glow-divider" />

      {/* Main Profile Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="section-container section-glow-amber rounded-3xl p-6 md:p-10 bg-slate-900/20 border border-amber-400/30 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar Initials Circle */}
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-400 via-indigo-500 to-emerald-400 shadow-2xl shadow-amber-500/20 shrink-0 flex items-center justify-center">
            <span className="text-4xl font-black text-black font-display tracking-tight">
              {getInitials(currentProfile.name)}
            </span>
          </div>

          {/* User Meta Summary */}
          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {isEditingName ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setProfile({ ...currentProfile, name: name.trim() || 'Vận động viên' })
                    setIsEditingName(false)
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    onBlur={() => setIsEditingName(false)}
                    className="text-3xl font-display font-black text-white bg-[#070714] border-b-2 border-amber-400 outline-none px-2 py-1 rounded-lg max-w-[260px]"
                  />
                  <button type="submit" className="text-amber-400 hover:text-amber-300">
                    <CheckCircle className="w-6 h-6" />
                  </button>
                </form>
              ) : (
                <h2
                  className="text-3xl font-display font-black text-white cursor-pointer hover:text-amber-300 transition-colors group flex items-center gap-2"
                  onClick={() => {
                    setName(currentProfile.name)
                    setIsEditingName(true)
                  }}
                >
                  {currentProfile.name}
                  <Edit3 className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                </h2>
              )}
              {currentProfile.role === 'admin' && (
                <span className="px-3.5 py-1 bg-amber-400 text-black font-mono text-xs font-black rounded-full inline-flex items-center gap-1 uppercase shadow-[0_0_15px_rgba(251,191,36,0.6)]">
                  👑 SUPER ADMIN SYSTEM
                </span>
              )}
              <span className="px-3.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full font-mono text-xs font-bold inline-block uppercase">
                {currentProfile.age} tuổi • {currentProfile.gender === 'male' ? 'Nam' : 'Nữ'}
              </span>
            </div>

            <p className="text-sm font-mono text-slate-300">
              Mục tiêu chính: <strong className="text-amber-400 font-extrabold">{goalLabels[currentProfile.goal]}</strong>
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <span className="text-xs font-mono px-3 py-1 bg-slate-900 text-slate-300 border border-slate-700 rounded-xl">
                Kinh nghiệm: {experienceLabels[currentProfile.experience]}
              </span>
              <span className="text-xs font-mono px-3 py-1 bg-slate-900 text-cyan-300 border border-slate-700 rounded-xl">
                Lịch tập: {currentProfile.sessions_per_week} buổi / tuần
              </span>
            </div>

            {/* Social Links Badge */}
            <div className="flex items-center justify-center md:justify-start gap-3 pt-2 text-xs font-mono">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/40 rounded-xl hover:bg-blue-600/30 transition-all font-bold">
                🌐 Facebook
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="px-3 py-1 bg-pink-600/20 text-pink-400 border border-pink-500/40 rounded-xl hover:bg-pink-600/30 transition-all font-bold">
                📸 Instagram
              </a>
              <a href="https://strava.com" target="_blank" rel="noreferrer" className="px-3 py-1 bg-orange-600/20 text-orange-400 border border-orange-500/40 rounded-xl hover:bg-orange-600/30 transition-all font-bold">
                🏃 Strava Gym
              </a>
            </div>
          </div>
        </div>

        {/* Editing Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="mt-8 pt-8 border-t border-slate-700/80 space-y-6">
            <h3 className="text-lg font-bold text-amber-400 uppercase font-mono flex items-center gap-2">
              <Edit3 className="w-5 h-5" /> CHỈNH SỬA THÔNG TIN THỂ HÌNH
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1">HỌ VÀ TÊN</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#070714] border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1">TUỔI</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-[#070714] border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1">CHIỀU CAO (CM)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full bg-[#070714] border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1">CÂN NẶNG (KG)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full bg-[#070714] border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1">TY LỆ MỠ (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  className="w-full bg-[#070714] border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1">MỤC TIÊU GYM</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as any)}
                  className="w-full bg-[#070714] border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-white font-bold"
                >
                  <option value="recomposition">Tăng cơ Giảm mỡ (Body Recomp)</option>
                  <option value="bulking">Tăng cơ (Bulking)</option>
                  <option value="cutting">Giảm mỡ (Cutting)</option>
                  <option value="strength">Tăng sức mạnh</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-8 py-3.5 btn-aura-gold text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl"
            >
              <Save className="w-4 h-4" />
              LƯU THAY ĐỔI
            </button>
          </form>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <SpatialCard className="p-6 rounded-3xl border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">CÂN NẶNG</span>
            <Scale className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{currentProfile.weight_kg} <span className="text-xs text-slate-400">kg</span></p>
        </SpatialCard>

        <SpatialCard className="p-6 rounded-3xl border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">CHIỀU CAO</span>
            <Ruler className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{currentProfile.height_cm} <span className="text-xs text-slate-400">cm</span></p>
        </SpatialCard>

        <SpatialCard className="p-6 rounded-3xl border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">CHỈ SỐ BMI</span>
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-extrabold text-cyan-300 font-mono">{bmi}</p>
        </SpatialCard>

        <SpatialCard className="p-6 rounded-3xl border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">TỶ LỆ MỠ (BF)</span>
            <Flame className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 font-mono">
            {currentProfile.body_fat ? `${currentProfile.body_fat}%` : '---'}
          </p>
        </SpatialCard>
      </div>



      {/* Metabolism & Calorie Targets Card */}
      <div className="aura-glass rounded-3xl p-6 md:p-8 space-y-6">
        <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          NĂNG LƯỢNG CHUYỂN HÓA &amp; CALO GỢI Ý (ESTIMATED METABOLISM)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-[#070714] border border-slate-800 space-y-2">
            <span className="text-xs font-mono text-slate-400 uppercase block font-bold">BMR (TỶ LỆ TRAO ĐỔI CHẤT CƠ BẢN)</span>
            <p className="text-3xl font-extrabold text-amber-400 font-mono">{bmr} <span className="text-xs text-slate-400">kcal / ngày</span></p>
            <p className="text-xs text-slate-400">Mức năng lượng tối thiểu để duy trì sự sống khi nghỉ ngơi hoàn toàn.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#070714] border border-slate-800 space-y-2">
            <span className="text-xs font-mono text-slate-400 uppercase block font-bold">TDEE (TỔNG TIÊU THỤ CALO HÀNG NGÀY)</span>
            <p className="text-3xl font-extrabold text-cyan-300 font-mono">{tdee} <span className="text-xs text-slate-400">kcal / ngày</span></p>
            <p className="text-xs text-slate-400">Dự đoán lượng Calo đốt cháy bao gồm hoạt động thể thao &amp; tập gym.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center gap-3 text-xs text-amber-300 font-mono">
          <ShieldCheck className="w-5 h-5 shrink-0 text-amber-400" />
          <span>Gợi ý cho mục tiêu {goalLabels[currentProfile.goal]}: Giữ mức Calo hàng ngày khoảng <strong>{currentProfile.goal === 'bulking' ? tdee + 300 : currentProfile.goal === 'cutting' ? tdee - 400 : tdee} kcal</strong> kết hợp nạp ~{Math.round(currentProfile.weight_kg * 2)}g Protein/ngày!</span>
        </div>
      </div>

      {/* Telegram Bot Integration Card */}
      <div className="aura-glass rounded-3xl p-6 md:p-8 space-y-6 border-cyan-500/30 mb-12 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 rounded-2xl shrink-0">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                TELEGRAM BOT &amp; PUSH NOTIFICATION
              </h3>
              <p className="text-xs font-mono text-slate-400">Tự động nhận lịch tập hằng ngày lúc 7:00 AM + thông báo kết quả buổi tập qua Telegram Bot</p>
            </div>
          </div>

          <span className="px-3.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full font-mono text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            BOT ONLINE
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Config Box */}
          <div className="p-5 rounded-2xl bg-[#070714] border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <label className="text-xs font-mono text-slate-300 uppercase block font-bold mb-2 flex items-center gap-2">
                TELEGRAM CHAT ID
                <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded text-[10px]">SỐ HOẶC @USERNAME</span>
              </label>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="VD: 123456789 (Lấy từ lệnh /myid của bot)"
                  value={telegramChatId}
                  onChange={(e) => {
                    const val = e.target.value.trim()
                    setTelegramChatId(val.startsWith('@') ? val : val.replace(/[^0-9-]/g, ''))
                  }}
                  className="w-full bg-[#03030a] border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder:text-slate-600 transition-colors"
                />
              </div>
            </div>

            {/* Auto-Send Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-slate-300">TỰ ĐỘNG GỬI LỊCH TẬP LÚC 7:00 AM</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoSendRoutine(!autoSendRoutine)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoSendRoutine ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    autoSendRoutine ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={!telegramChatId.trim()}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold font-mono text-xs rounded-xl transition-all shadow-md disabled:opacity-40"
            >
              LƯU CÀI ĐẶT TELEGRAM
            </button>

            <div className="text-[11px] text-slate-400 font-mono leading-relaxed space-y-1 mt-1">
              <p>📌 Cách lấy Chat ID của bạn (bắt buộc dùng số):</p>
              <p>1. Nhắn <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">/start</code> cho <a href="https://t.me/Aura_fit_tele_bot" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">@Aura_fit_tele_bot</a></p>
              <p>2. Gửi lệnh <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">/myid</code> → copy dãy số Chat ID</p>
              <p>3. Dán số đó vào ô trên (<span className="text-red-400">@username không hoạt động</span> cho tin nhắn cá nhân)</p>
            </div>
          </div>

          {/* Test Action Box */}
          <div className="p-5 rounded-2xl bg-[#070714] border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase block font-bold mb-1 flex items-center gap-1.5">
                <Bell className="w-4 h-4" /> THỬ NGHIỆM KẾT NỐI LIVE
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">Gửi ngay 1 thông báo thử nghiệm tới Telegram để kiểm tra luồng Webhook live của ứng dụng.</p>
            </div>

            <button
              onClick={handleTestTelegramNotification}
              disabled={testingTelegram || !telegramChatId.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-black font-black font-display rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all border border-amber-300/40"
            >
              <Send className="w-4 h-4 fill-current" />
              {testingTelegram ? 'ĐANG GỬI THÔNG BÁO...' : 'THỬ GỬI THÔNG BÁO TELEGRAM'}
            </button>

            <div className="text-[11px] text-slate-500 font-mono leading-relaxed text-center">
              ⏰ Bạn sẽ nhận được lịch tập hằng ngày vào <strong className="text-cyan-400">7:00 AM</strong> nếu đã bật tự động gửi!
            </div>
          </div>
        </div>

        {telegramSaveStatus && (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-mono ${
            telegramSaveStatus.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/10 border-red-500/40 text-red-300'
          }`}>
            {telegramSaveStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            )}
            <span>{telegramSaveStatus.message}</span>
          </div>
        )}

        {telegramTestStatus && (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-mono ${
            telegramTestStatus.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/10 border-red-500/40 text-red-300'
          }`}>
            {telegramTestStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            )}
            <span>{telegramTestStatus.message}</span>
          </div>
        )}
      </div>{/* END TELEGRAM SETTINGS CARD */}

      {/* Export Data Card */}
      <div className="aura-glass rounded-3xl p-6 md:p-8 space-y-4 border-emerald-500/30">
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
          📤 XUẤT DỮ LIỆU TẬP LUYỆN
        </h3>
        <p className="text-xs text-slate-400 font-mono">Xuất toàn bộ lịch sử buổi tập ra file CSV để theo dõi trên Excel hoặc Google Sheets.</p>
        <button
          onClick={() => exportWorkoutDataCSV(useWorkoutStore.getState().workoutHistory)}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-extrabold font-mono text-xs rounded-xl transition-all shadow-lg flex items-center gap-2"
        >
          ⬇ XUẤT CSV
        </button>
      </div>

      {/* Danger Zone - Reset All Data */}
      <div className="rounded-3xl border-2 border-red-500/30 bg-red-500/5 p-6 md:p-8 space-y-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
        <div className="relative">
          <h3 className="text-lg font-extrabold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            VÙNG NGUY HIỂM — XÓA TẤT CẢ DỮ LIỆU
          </h3>
          <p className="text-xs text-slate-400 font-mono leading-relaxed mt-2 max-w-2xl">
            Xóa toàn bộ lịch sử tập luyện, giáo án cá nhân, kỷ lục và hồ sơ của bạn trên <strong className="text-red-300">cả máy chủ lẫn trình duyệt</strong>.
            Bạn sẽ được đưa về trang khởi tạo (Onboarding) để bắt đầu lại từ đầu. <strong className="text-amber-300">Tài khoản đăng nhập sẽ được giữ nguyên.</strong>
          </p>
          <button
            onClick={() => { setResetModalOpen(true); setResetEmailInput(''); setResetError('') }}
            className="mt-4 px-6 py-3 bg-red-500/20 hover:bg-red-500/40 text-red-300 font-black text-xs uppercase tracking-wider rounded-xl border border-red-500/50 transition-all flex items-center gap-2 shadow-xl hover:shadow-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
            XÓA TẤT CẢ DỮ LIỆU
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {resetModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]"
              onClick={() => !isResetting && setResetModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-md rounded-3xl border-2 border-red-500/40 bg-[#0a0a14] shadow-2xl shadow-red-500/20 overflow-hidden">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-red-300">⚠️ XÓA TOÀN BỘ DỮ LIỆU?</h3>
                      <p className="text-[11px] text-slate-400 font-mono">Hành động này KHÔNG THỂ hoàn tác.</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 font-mono bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <p>🗑️ Lịch sử buổi tập (workout logs)</p>
                    <p>🗑️ Chi tiết hiệp tập (set logs)</p>
                    <p>🗑️ Giáo án cá nhân + bài tập</p>
                    <p>♻️ Hồ sơ, kỷ lục, số đo — reset về mặc định</p>
                    <p>✅ Giữ nguyên: Tài khoản đăng nhập</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">
                      Gõ email của bạn để xác nhận:
                    </label>
                    <input
                      type="email"
                      value={resetEmailInput}
                      onChange={(e) => { setResetEmailInput(e.target.value); setResetError('') }}
                      placeholder={profile?.email || 'email@example.com'}
                      disabled={isResetting}
                      className="w-full bg-[#070714] border border-red-500/30 rounded-xl px-4 py-3 text-white focus:border-red-400 focus:outline-none placeholder-slate-600"
                    />
                    {resetError && (
                      <p className="mt-2 text-xs font-bold text-red-400">❌ {resetError}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setResetModalOpen(false)}
                      disabled={isResetting}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                      HỦY
                    </button>
                    <button
                      onClick={handleFullReset}
                      disabled={isResetting}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isResetting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> ĐANG XÓA...</>
                      ) : (
                        <><Trash2 className="w-4 h-4" /> XÓA NGAY</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tele Bot Version */}
      <div className="text-center pt-4 pb-8">
        <p className="text-[10px] font-mono text-slate-600">AURA.FIT v1.0 • Gym Workout Tracker • Made with ❤️</p>
      </div>
    </div>
  )
}
