'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProfileStore, UserProfile } from '@/store/use-profile-store'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Ruler, Target, ArrowRight, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react'

const experienceOptions = [
  { value: 'beginner', label: 'Mới bắt đầu', desc: 'Chưa tập hoặc dưới 6 tháng' },
  { value: '6m-1y', label: '6 tháng – 1 năm', desc: 'Đã quen với các bài tập cơ bản' },
  { value: '1y-3y', label: '1 – 3 năm', desc: 'Tập đều đặn, hiểu về form' },
  { value: '3y+', label: 'Trên 3 năm', desc: 'Dày dạn kinh nghiệm' },
]

const goalOptions = [
  { value: 'recomposition', label: 'Tăng Cơ Giảm Mỡ (Body Recomp)', emoji: '⚡' },
  { value: 'bulking', label: 'Tăng Cơ (Bulking)', emoji: '💪' },
  { value: 'cutting', label: 'Giảm Mỡ (Cutting)', emoji: '🔥' },
  { value: 'strength', label: 'Tăng Sức Mạnh', emoji: '🏋️' },
]

const sessionsOptions = [3, 4, 5, 6]

export default function OnboardingPage() {
  const router = useRouter()
  const { setProfile } = useProfileStore()
  const [step, setStep] = useState(1)

  // Step 1 fields
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')

  // Read temp name from register page if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tempName = localStorage.getItem('aura_register_temp_name')
      if (tempName) {
        setName(tempName)
        localStorage.removeItem('aura_register_temp_name')
      }
    }
  }, [])

  // Step 2 fields
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [bodyFat, setBodyFat] = useState('')

  // Step 3 fields
  const [experience, setExperience] = useState('1y-3y')
  const [goal, setGoal] = useState('recomposition')
  const [sessionsPerWeek, setSessionsPerWeek] = useState(5)

  const [isSaving, setIsSaving] = useState(false)

  const canProceedStep1 = name.trim().length > 0 && age.length > 0
  const canProceedStep2 = heightCm.length > 0 && weightKg.length > 0

  const handleComplete = async () => {
    setIsSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const role: 'admin' | 'user' = 'user' // Default role

    const profileUpdates = {
      full_name: name.trim(),
      age: parseInt(age) || 20,
      gender,
      height_cm: parseFloat(heightCm) || 170,
      weight_kg: parseFloat(weightKg) || 70,
      body_fat: bodyFat ? parseFloat(bodyFat) : null,
      experience: experience,
      goal: goal,
      sessions_per_week: sessionsPerWeek
    }

    // Save to Supabase
    const { error } = await supabase.from('profiles').update(profileUpdates).eq('id', user.id)

    if (error) {
      console.error('Error saving profile:', error)
      alert('Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.')
      setIsSaving(false)
      return
    }

    // Update local Zustand store
    const localProfile: UserProfile = {
      name: name.trim(),
      age: parseInt(age) || 20,
      gender,
      height_cm: parseFloat(heightCm) || 170,
      weight_kg: parseFloat(weightKg) || 70,
      body_fat: bodyFat ? parseFloat(bodyFat) : null,
      experience: experience as UserProfile['experience'],
      goal: goal as UserProfile['goal'],
      sessions_per_week: sessionsPerWeek,
      role
    }
    
    setProfile(localProfile)
    router.push('/dashboard')
  }

  const stepIcons = [User, Ruler, Target]
  const stepTitles = ['THÔNG TIN CÁ NHÂN', 'CHỈ SỐ CƠ THỂ', 'KINH NGHIỆM & MỤC TIÊU']

  return (
    <div className="min-h-screen bg-[#030308] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Spatial Glows */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/8 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/8 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-4 bg-gradient-to-tr from-amber-400 via-indigo-500 to-emerald-400 rounded-2xl mb-4 shadow-2xl shadow-amber-500/20">
            <Sparkles className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-display font-black tracking-tight gold-gradient-text">
            THIẾT LẬP HỒ SƠ THỂ HÌNH
          </h1>
          <p className="text-slate-500 text-xs font-mono tracking-wider mt-1 uppercase">AURA.FIT ONBOARDING</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2, 3].map((s) => {
            const StepIcon = stepIcons[s - 1]
            return (
              <div key={s} className="flex-1 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                  step === s
                    ? 'bg-amber-400 border-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                    : step > s
                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-400'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}>
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                </div>
                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
                  step === s ? 'text-amber-400' : step > s ? 'text-emerald-400' : 'text-slate-600'
                }`}>
                  {stepTitles[s - 1]}
                </span>
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="aura-glass rounded-3xl p-8 shadow-2xl border-amber-500/20"
          >
            {/* ========== STEP 1: Personal Info ========== */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-2">
                  <h2 className="text-xl font-display font-black text-white">👤 Thông Tin Cá Nhân</h2>
                  <p className="text-xs font-mono text-slate-400 mt-1">Cho AURA biết bạn là ai</p>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 block">TÊN CỦA BẠN</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nhân"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#070714] border border-slate-800 focus:border-amber-400 rounded-2xl px-5 py-3.5 text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 block">TUỔI</label>
                  <input
                    type="number"
                    required
                    placeholder="VD: 22"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-[#070714] border border-slate-800 focus:border-amber-400 rounded-2xl px-5 py-3.5 text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 block">GIỚI TÍNH</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'male', label: 'NAM', emoji: '🧑' },
                      { value: 'female', label: 'NỮ', emoji: '👩' },
                    ].map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => setGender(g.value as 'male' | 'female')}
                        className={`p-4 rounded-2xl border-2 text-center font-bold transition-all ${
                          gender === g.value
                            ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                            : 'bg-[#070714] border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{g.emoji}</span>
                        <span className="text-xs font-mono uppercase tracking-wider">{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========== STEP 2: Body Metrics ========== */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-2">
                  <h2 className="text-xl font-display font-black text-white">📏 Chỉ Số Cơ Thể</h2>
                  <p className="text-xs font-mono text-slate-400 mt-1">Dữ liệu cơ bản để tính toán chính xác</p>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 block">CHIỀU CAO (CM)</label>
                  <input
                    type="number"
                    required
                    placeholder="VD: 175"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full bg-[#070714] border border-slate-800 focus:border-amber-400 rounded-2xl px-5 py-3.5 text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 block">CÂN NẶNG (KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="VD: 72.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full bg-[#070714] border border-slate-800 focus:border-amber-400 rounded-2xl px-5 py-3.5 text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 block">TỶ LỆ MỠ CƠ THỂ % (TÙY CHỌN)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Bỏ trống nếu chưa biết"
                      value={bodyFat}
                      onChange={(e) => setBodyFat(e.target.value)}
                      className="flex-1 bg-[#070714] border border-slate-800 focus:border-cyan-400 rounded-2xl px-5 py-3.5 text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition-all"
                    />
                    {heightCm && weightKg && age && (
                      <button
                        type="button"
                        onClick={() => {
                          const bmi = parseFloat(weightKg) / ((parseFloat(heightCm) / 100) ** 2)
                          const ageNum = parseInt(age) || 20
                          const genderFactor = gender === 'male' ? 1 : 0
                          const estimated = (1.2 * bmi + 0.23 * ageNum - 10.8 * genderFactor - 5.4).toFixed(1)
                          setBodyFat(estimated)
                        }}
                        className="px-4 py-3.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 font-mono font-bold text-[10px] uppercase rounded-2xl whitespace-nowrap transition-all"
                      >
                        ƯỚC TÍNH<br/>TỰ ĐỘNG
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 mt-1.5">💡 Bấm nút "Ước tính tự động" để tính gần đúng dựa trên BMI, tuổi và giới tính (công thức Deurenberg)</p>
                </div>

                {/* BMI Preview */}
                {heightCm && weightKg && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-center">
                    <span className="text-[10px] font-mono text-amber-300 uppercase font-bold block mb-1">CHỈ SỐ BMI CỦA BẠN</span>
                    <p className="text-2xl font-extrabold text-amber-400 font-mono">
                      {(parseFloat(weightKg) / ((parseFloat(heightCm) / 100) ** 2)).toFixed(1)}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400">
                      {(() => {
                        const bmi = parseFloat(weightKg) / ((parseFloat(heightCm) / 100) ** 2)
                        if (bmi < 18.5) return 'Thiếu cân'
                        if (bmi < 25) return 'Bình thường'
                        if (bmi < 30) return 'Thừa cân'
                        return 'Béo phì'
                      })()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ========== STEP 3: Experience & Goals ========== */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-2">
                  <h2 className="text-xl font-display font-black text-white">🏋️ Kinh Nghiệm & Mục Tiêu</h2>
                  <p className="text-xs font-mono text-slate-400 mt-1">AURA sẽ tùy chỉnh theo mức độ của bạn</p>
                </div>

                {/* Experience */}
                <div>
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3 block">KINH NGHIỆM TẬP GYM</label>
                  <div className="flex flex-col gap-2">
                    {experienceOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setExperience(opt.value)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          experience === opt.value
                            ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                            : 'bg-[#070714] border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <span className={`font-bold text-sm ${experience === opt.value ? 'text-amber-300' : 'text-slate-200'}`}>{opt.label}</span>
                        <span className="text-[10px] font-mono text-slate-500 block mt-0.5">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goal */}
                <div>
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3 block">MỤC TIÊU CHÍNH</label>
                  <div className="grid grid-cols-2 gap-3">
                    {goalOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setGoal(opt.value)}
                        className={`p-4 rounded-2xl border-2 text-center transition-all ${
                          goal === opt.value
                            ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                            : 'bg-[#070714] border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <span className="text-xl block mb-1">{opt.emoji}</span>
                        <span className={`text-xs font-mono font-bold uppercase ${goal === opt.value ? 'text-amber-300' : 'text-slate-300'}`}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sessions Per Week */}
                <div>
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3 block">SỐ BUỔI TẬP MỖI TUẦN</label>
                  <div className="grid grid-cols-4 gap-3">
                    {sessionsOptions.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setSessionsPerWeek(n)}
                        className={`p-3 rounded-2xl border-2 text-center font-mono font-extrabold text-lg transition-all ${
                          sessionsPerWeek === n
                            ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                            : 'bg-[#070714] border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center gap-4 mt-8">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3.5 bg-slate-900 text-slate-300 font-bold rounded-2xl text-xs uppercase tracking-widest flex items-center gap-2 border border-slate-700 hover:bg-slate-800 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  QUAY LẠI
                </button>
              )}

              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                  className="flex-1 py-4 btn-aura-gold text-black font-display font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  TIẾP TỤC
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-4 btn-aura-gold text-black font-black rounded-2xl text-sm flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl disabled:opacity-50"
                >
                  {isSaving ? 'ĐANG LƯU...' : 'HOÀN THÀNH'}
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
