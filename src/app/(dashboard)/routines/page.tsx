'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { parseExcelRoutine, ParsedRoutine } from '@/lib/utils/excel-parser'
import { getTodayWorkoutMapping } from '@/lib/utils/date-schedule'
import { exportRoutineToExcel } from '@/lib/utils/export-data'
import { sendTelegramWebhook } from '@/lib/telegram-webhook'
import { FileSpreadsheet, Upload, Play, Calendar, Eye, Download, PlusCircle, Trash2, X, Plus, Send, CheckCircle } from 'lucide-react'
import { useWorkoutStore } from '@/store/use-workout-store'
import { useProfileStore } from '@/store/use-profile-store'

const samplePPLULMasterV7: ParsedRoutine = {
  routineName: 'PPL-UL MASTER v7 (GymOS Master Program)',
  days: [
    {
      dayName: 'PUSH (Ngực - Vai - Tay Sau)',
      exercises: [
        { exerciseName: 'Machine Chest Press', muscleGroup: 'Chest', sets: 3, reps: '8–10', weightKg: '--', notes: 'Form gồng vai chắc' },
        { exerciseName: 'Incline DB Press', muscleGroup: 'Chest', sets: 3, reps: '8–10', weightKg: '--', notes: 'Góc ghế 30 độ' },
        { exerciseName: 'Pec Deck (Ép Ngực)', muscleGroup: 'Chest', sets: 2, reps: '12–15', weightKg: '--', notes: 'Căng lồng ngực hết cỡ' },
        { exerciseName: 'Machine Shoulder Press', muscleGroup: 'Shoulders', sets: 2, reps: '8–10', weightKg: '--', notes: 'Gồng bụng chắc chắn' },
        { exerciseName: 'Lateral Raise', muscleGroup: 'Shoulders', sets: 4, reps: '12–15', weightKg: '--', notes: 'Cô lập vai giữa' },
        { exerciseName: 'Cable Tricep Extension', muscleGroup: 'Arms', sets: 3, reps: '10–12', weightKg: '--', notes: 'Khóa cùi chỏ' },
      ],
    },
    {
      dayName: 'PULL (Lưng - Tay Trước)',
      exercises: [
        { exerciseName: 'Lat Pulldown', muscleGroup: 'Back', sets: 3, reps: '8–10', weightKg: 26, notes: 'Kéo cùi chỏ sát sườn' },
        { exerciseName: 'Chest Supported Row', muscleGroup: 'Back', sets: 3, reps: '8–10', weightKg: 15, notes: 'Ép chặt xương vai' },
        { exerciseName: 'Seated Cable Row', muscleGroup: 'Back', sets: 2, reps: '10', weightKg: 26, notes: 'Gồng thắt lưng' },
        { exerciseName: 'Rear Delt Fly', muscleGroup: 'Shoulders', sets: 2, reps: '12–15', weightKg: 12, notes: 'Tập trung vai sau' },
        { exerciseName: 'DB Curl', muscleGroup: 'Arms', sets: 2, reps: '10–12', weightKg: 5, notes: 'Xoay cổ tay khi cuộn' },
        { exerciseName: 'Rope Hammer Curl', muscleGroup: 'Arms', sets: 2, reps: '10–12', weightKg: 19, notes: 'Cô lập cơ tay trước' },
      ],
    },
    {
      dayName: 'LEGS (Đùi - Mông - Bắp Chân)',
      exercises: [
        { exerciseName: 'Leg Press', muscleGroup: 'Legs', sets: 3, reps: '10', weightKg: 15, notes: 'Xuống đùi song song' },
        { exerciseName: 'Lying Leg Curl', muscleGroup: 'Legs', sets: 4, reps: '10–12', weightKg: 19, notes: 'Căng hết cỡ đùi sau' },
        { exerciseName: 'Leg Extension', muscleGroup: 'Legs', sets: 3, reps: '12', weightKg: 26, notes: 'Vắt kiệt đùi trước' },
        { exerciseName: 'Hip Abduction Machine', muscleGroup: 'Legs', sets: 3, reps: '15–20', weightKg: 16, notes: 'Phát triển mông đùi' },
        { exerciseName: 'Standing Calf Raise', muscleGroup: 'Legs', sets: 4, reps: '15', weightKg: 15, notes: 'Đẩy nhón bắp chân' },
        { exerciseName: 'Cable Crunch', muscleGroup: 'Core', sets: 3, reps: '12–15', weightKg: 12, notes: 'Gập bụng dưới tạ' },
      ],
    },
    {
      dayName: 'UPPER (Thân Trên Toàn Diện)',
      exercises: [
        { exerciseName: 'Incline Machine Press', muscleGroup: 'Chest', sets: 3, reps: '8', weightKg: 12.5, notes: 'Phát triển ngực trên' },
        { exerciseName: 'Lat Pulldown', muscleGroup: 'Back', sets: 3, reps: '8', weightKg: 26, notes: 'Kéo phát triển xô' },
        { exerciseName: 'Seated Row Machine', muscleGroup: 'Back', sets: 3, reps: '10', weightKg: 26, notes: 'Tập trung lưng giữa' },
        { exerciseName: 'Machine Shoulder Press', muscleGroup: 'Shoulders', sets: 3, reps: '8', weightKg: 7.5, notes: 'Đẩy vai dứt khoát' },
        { exerciseName: 'Lateral Raise', muscleGroup: 'Shoulders', sets: 3, reps: '15', weightKg: 12, notes: 'Fail 12 nên về 10 thôi' },
        { exerciseName: 'Cable Curl', muscleGroup: 'Arms', sets: 2, reps: '12', weightKg: 20, notes: 'Cuộn tay trước với cáp' },
        { exerciseName: 'Tricep Extension', muscleGroup: 'Arms', sets: 2, reps: '12', weightKg: 20, notes: 'Duỗi tay sau' },
      ],
    },
    {
      dayName: 'LOWER (Thân Dưới + Core)',
      exercises: [
        { exerciseName: 'Hack Squat', muscleGroup: 'Legs', sets: 3, reps: '8–10', weightKg: '--', notes: 'Gập gối sâu gồng bụng' },
        { exerciseName: 'Lying Leg Curl', muscleGroup: 'Legs', sets: 4, reps: '10–12', weightKg: '--', notes: 'Tác động đùi sau' },
        { exerciseName: 'Leg Extension', muscleGroup: 'Legs', sets: 3, reps: '12', weightKg: '--', notes: 'Duỗi đùi trước' },
        { exerciseName: 'Standing Calf Raise', muscleGroup: 'Legs', sets: 4, reps: '15', weightKg: '--', notes: 'Bắp chân' },
        { exerciseName: 'Cable Crunch', muscleGroup: 'Core', sets: 3, reps: '12', weightKg: '--', notes: 'Gập bụng cáp' },
      ],
    },
  ],
}

export default function RoutinesPage() {
  const { profile } = useProfileStore()
  const [importedRoutine, setImportedRoutine] = useState<ParsedRoutine | null>(null)
  const [showFullSchedule, setShowFullSchedule] = useState(false)
  const [todaySchedule, setTodaySchedule] = useState<any>(null)
  const [sendingTeleRoutine, setSendingTeleRoutine] = useState(false)

  // Custom Routine Creator Modal State
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false)
  const [newRoutineName, setNewRoutineName] = useState('My Custom PPL Routine')
  const [newDays, setNewDays] = useState<
    Array<{
      dayName: string
      exercises: Array<{ exerciseName: string; muscleGroup: string; sets: number; reps: string; weightKg: string | number; notes: string }>
    }>
  >([
    {
      dayName: 'Day 1: PUSH',
      exercises: [{ exerciseName: 'Bench Press', muscleGroup: 'Chest', sets: 3, reps: '8-10', weightKg: 60, notes: '' }],
    },
    {
      dayName: 'Day 2: PULL',
      exercises: [{ exerciseName: 'Lat Pulldown', muscleGroup: 'Back', sets: 3, reps: '8-10', weightKg: 50, notes: '' }],
    },
    {
      dayName: 'Day 3: LEGS',
      exercises: [{ exerciseName: 'Squat', muscleGroup: 'Legs', sets: 3, reps: '8-10', weightKg: 70, notes: '' }],
    },
  ])

  const { startWorkout, addExerciseToWorkout } = useWorkoutStore()
  const router = useRouter()

  useEffect(() => {
    const todayInfo = getTodayWorkoutMapping()
    setTodaySchedule(todayInfo)

    if (typeof window !== 'undefined') {
      const savedRoutine = localStorage.getItem('aura_custom_routine')
      if (savedRoutine) {
        try {
          setImportedRoutine(JSON.parse(savedRoutine))
        } catch (e) {
          setImportedRoutine(null)
        }
      } else {
        setImportedRoutine(null)
      }
    }
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const buffer = evt.target?.result as ArrayBuffer
      try {
        const parsed = parseExcelRoutine(buffer)
        setImportedRoutine(parsed)
        if (typeof window !== 'undefined') {
          localStorage.setItem('aura_custom_routine', JSON.stringify(parsed))
        }
        alert(`Đã nạp thành công file Excel: ${parsed.routineName} với ${parsed.days.length} ngày tập!`)
      } catch (err) {
        alert('File Excel không đúng định dạng. Vui lòng kiểm tra các cột!')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleExportExcel = () => {
    if (!importedRoutine) return
    exportRoutineToExcel(importedRoutine.routineName, importedRoutine.days)
  }

  const handleStartDaySession = (dayName: string, exercises: any[]) => {
    startWorkout(crypto.randomUUID(), dayName)
    exercises.forEach((ex) => {
      addExerciseToWorkout(crypto.randomUUID(), ex.exerciseName, ex.muscleGroup)
    })
    router.push('/workout')
  }

  const todayMatchedDay = importedRoutine?.days.find((d) =>
    d.dayName.toUpperCase().includes(todaySchedule?.suggestedDayKey || 'PUSH')
  ) || importedRoutine?.days[0]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-700/80 pb-6">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
            AUTOMATIC CALENDAR SCHEDULER
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            LỊCH TẬP HÔM NAY
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFullSchedule(!showFullSchedule)}
            className="px-5 py-3.5 aura-glass border-amber-400/50 text-amber-300 font-bold rounded-2xl text-sm flex items-center gap-2 cursor-pointer"
          >
            <Eye className="w-5 h-5" />
            {showFullSchedule ? 'ẨN FULL LỊCH' : 'XEM FULL LỊCH TẬP'}
          </button>

          {/* Create Custom Routine Button */}
          <button
            onClick={() => setIsCreatingRoutine(true)}
            className="px-5 py-3.5 aura-glass border-indigo-400/50 text-indigo-300 font-bold rounded-2xl text-sm flex items-center gap-2 hover:bg-indigo-500/10 transition-all shadow-xl cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 text-indigo-400" />
            TẠO LỊCH TẬP MỚI
          </button>

          {/* Export Routine Excel Button */}
          <button
            onClick={handleExportExcel}
            className="px-5 py-3.5 aura-glass border-emerald-400/50 text-emerald-400 font-bold rounded-2xl text-sm flex items-center gap-2 hover:bg-emerald-500/10 transition-all shadow-xl cursor-pointer"
          >
            <Download className="w-5 h-5" />
            XUẤT EXCEL LỊCH TẬP
          </button>

          {/* Upload Excel Button */}
          <label className="cursor-pointer px-6 py-3.5 btn-aura-gold text-black font-extrabold rounded-2xl text-sm flex items-center gap-2 shadow-xl">
            <Upload className="w-5 h-5" />
            <span>NHẬP FILE EXCEL</span>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* TODAY CARD */}
      {todaySchedule && (
        <div className="aura-glass rounded-3xl p-6 md:p-8 border-amber-400/50 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-500/20 border border-amber-400 rounded-2xl text-amber-400">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                  THỜI GIAN HIỆN TẠI
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">{todaySchedule.dateFormatted}</h2>
              </div>
            </div>

            {todayMatchedDay && todaySchedule.suggestedDayKey !== 'REST' && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={async () => {
                    setSendingTeleRoutine(true)
                    const exListText = todayMatchedDay.exercises.map((e) => `• ${e.exerciseName} (${e.sets} sets x ${e.reps})`).join('\n')
                    const res = await sendTelegramWebhook({
                      event_type: 'workout_completed',
                      user_email: `${(profile?.name || 'athlete').toLowerCase().replace(/\s+/g, '')}@aura.fit`,
                      user_name: profile?.name || 'Vận động viên AURA',
                      title: `📋 LỊCH TẬP HÔM NAY: ${todayMatchedDay.dayName}`,
                      message: `Lịch tập ngày ${todaySchedule.dateFormatted}:\n\n${exListText}`,
                      telegram_chat_id: profile?.telegram_chat_id || undefined,
                      metrics: {
                        'Ngày tập': todayMatchedDay.dayName,
                        'Số bài tập': todayMatchedDay.exercises.length
                      }
                    })
                    setSendingTeleRoutine(false)
                    if (res.success) {
                      alert(`Đã gửi lịch tập "${todayMatchedDay.dayName}" sang Telegram thành công!`)
                    } else {
                      alert(res.error || 'Lỗi khi gửi lịch tập')
                    }
                  }}
                  disabled={sendingTeleRoutine}
                  className="px-5 py-4 aura-glass border-cyan-400/50 text-cyan-300 font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-cyan-500/10 transition-all shadow-xl disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-5 h-5 text-cyan-400" />
                  {sendingTeleRoutine ? 'ĐANG GỬI...' : 'GỬI LỊCH SANG TELEGRAM'}
                </button>

                <button
                  onClick={() => handleStartDaySession(todayMatchedDay.dayName, todayMatchedDay.exercises)}
                  className="px-8 py-4 btn-aura-gold text-black font-black rounded-2xl text-base flex items-center justify-center gap-3 shadow-2xl"
                >
                  <Play className="w-6 h-6 fill-current" />
                  TẬP NGAY BÀI HÔM NAY ({todaySchedule.suggestedDayKey})
                </button>
              </div>
            )}
          </div>

          {/* Today Exercises Preview */}
          {todaySchedule.suggestedDayKey === 'REST' ? (
            <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-700 text-center">
              <p className="text-amber-400 font-bold text-xl mb-1">HÔM NAY LÀ NGÀY NGHỈ (REST DAY)</p>
              <p className="text-sm text-slate-300 font-medium">Nghỉ ngơi hồi phục cơ bắp và nạp đủ Protein!</p>
            </div>
          ) : (
            todayMatchedDay && (
              <div>
                <h3 className="text-lg font-bold text-amber-400 mb-4 uppercase">
                  Lịch Tập Gợi Ý: {todayMatchedDay.dayName}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {todayMatchedDay.exercises.map((ex, eIdx) => (
                    <div key={eIdx} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700">
                      <p className="font-bold text-white text-base mb-1">{ex.exerciseName}</p>
                      <div className="flex items-center justify-between text-sm font-mono text-slate-300">
                        <span>{ex.sets} Sets x {ex.reps} Reps</span>
                        <span className="font-bold text-cyan-300">{ex.weightKg !== '--' ? `${ex.weightKg} kg` : 'Bodyweight'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* FULL SCHEDULE SECTION */}
      {(showFullSchedule || !todaySchedule) && importedRoutine && (
        <div className="space-y-6">
          <div className="aura-glass p-6 rounded-3xl flex items-center justify-between border-amber-400/40">
            <div>
              <h2 className="text-2xl font-extrabold text-white">{importedRoutine.routineName}</h2>
              <p className="text-sm font-mono text-amber-300 mt-1 font-bold">DANH SÁCH {importedRoutine.days.length} NGÀY TẬP CHUẨN KHOA HỌC</p>
            </div>
            <div className="p-3.5 bg-amber-500/20 border border-amber-400 rounded-2xl text-amber-400">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {importedRoutine.days.map((day, idx) => (
              <div key={idx} className="aura-glass rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
                  <h3 className="text-2xl font-extrabold text-amber-400">{day.dayName}</h3>
                  <button
                    onClick={() => handleStartDaySession(day.dayName, day.exercises)}
                    className="px-6 py-3.5 btn-aura-gold text-black font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    BẮT ĐẦU BUỔI TẬP NÀY
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700 text-xs font-mono font-bold text-slate-300 uppercase">
                        <th className="pb-3 px-3">BÀI TẬP (EXERCISE)</th>
                        <th className="pb-3 px-3">NHÓM CƠ</th>
                        <th className="pb-3 px-3 text-center">SETS</th>
                        <th className="pb-3 px-3 text-center">REPS</th>
                        <th className="pb-3 px-3 text-center">MỨC TẠ (KG)</th>
                        <th className="pb-3 px-3">GHI CHÚ KĨ THUẬT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm">
                      {day.exercises.map((ex, eIdx) => (
                        <tr key={eIdx} className="hover:bg-slate-900/60 transition-colors">
                          <td className="py-4 px-3 font-bold text-white text-base">{ex.exerciseName}</td>
                          <td className="py-4 px-3">
                            <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-900 text-amber-300 border border-slate-700 rounded-full uppercase">
                              {ex.muscleGroup}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-center font-mono font-bold text-white text-base">{ex.sets}</td>
                          <td className="py-4 px-3 text-center font-mono font-bold text-white text-base">{ex.reps}</td>
                          <td className="py-4 px-3 text-center font-mono font-extrabold text-cyan-300 text-base">{ex.weightKg || '--'}</td>
                          <td className="py-4 px-3 text-xs text-slate-300 font-medium">{ex.notes || '---'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE CUSTOM ROUTINE MODAL */}
      {isCreatingRoutine && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="aura-glass rounded-3xl p-6 md:p-8 w-full max-w-3xl space-y-6 max-h-[90vh] overflow-y-auto border border-amber-400/50 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white gold-gradient-text">TẠO GIÁO ÁN TẬP CÁ NHÂN (CUSTOM ROUTINE)</h2>
                <p className="text-xs font-mono text-slate-400 mt-1">Tự thiết lập lịch Push Pull Legs, Upper Lower hoặc Split tùy chỉnh</p>
              </div>
              <button
                onClick={() => setIsCreatingRoutine(false)}
                className="p-2 bg-slate-900 text-slate-400 hover:text-white rounded-xl border border-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1">TÊN GIÁO ÁN / ROUTINE NAME</label>
                <input
                  type="text"
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  placeholder="e.g. My Personal PPL 6 Days"
                  className="w-full bg-[#070714] border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-white font-mono font-bold"
                />
              </div>

              {/* Days List */}
              <div className="space-y-6">
                {newDays.map((day, dIdx) => (
                  <div key={dIdx} className="p-5 rounded-2xl bg-[#070714] border border-slate-800 space-y-4 relative">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        value={day.dayName}
                        onChange={(e) => {
                          const updated = [...newDays]
                          updated[dIdx].dayName = e.target.value
                          setNewDays(updated)
                        }}
                        placeholder={`Day ${dIdx + 1} Name`}
                        className="bg-transparent text-lg font-extrabold text-amber-400 border-b border-amber-400/30 focus:border-amber-400 focus:outline-none px-1 py-1 w-full max-w-xs font-mono"
                      />
                      {newDays.length > 1 && (
                        <button
                          onClick={() => {
                            setNewDays(newDays.filter((_, idx) => idx !== dIdx))
                          }}
                          className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-mono cursor-pointer"
                        >
                          Xóa ngày
                        </button>
                      )}
                    </div>

                    {/* Exercises in Day */}
                    <div className="space-y-3">
                      {day.exercises.map((ex, eIdx) => (
                        <div key={eIdx} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                          <input
                            type="text"
                            placeholder="Bài tập (e.g. Bench Press)"
                            value={ex.exerciseName}
                            onChange={(e) => {
                              const updated = [...newDays]
                              updated[dIdx].exercises[eIdx].exerciseName = e.target.value
                              setNewDays(updated)
                            }}
                            className="sm:col-span-2 bg-[#070714] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                          />
                          <select
                            value={ex.muscleGroup}
                            onChange={(e) => {
                              const updated = [...newDays]
                              updated[dIdx].exercises[eIdx].muscleGroup = e.target.value
                              setNewDays(updated)
                            }}
                            className="bg-[#070714] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-amber-300 font-bold"
                          >
                            <option value="Chest">Chest</option>
                            <option value="Back">Back</option>
                            <option value="Shoulders">Shoulders</option>
                            <option value="Arms">Arms</option>
                            <option value="Legs">Legs</option>
                            <option value="Core">Core</option>
                          </select>
                          <input
                            type="number"
                            placeholder="Sets"
                            value={ex.sets}
                            onChange={(e) => {
                              const updated = [...newDays]
                              updated[dIdx].exercises[eIdx].sets = parseInt(e.target.value) || 3
                              setNewDays(updated)
                            }}
                            className="bg-[#070714] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono font-bold"
                          />
                          <input
                            type="text"
                            placeholder="Reps (e.g. 8-10)"
                            value={ex.reps}
                            onChange={(e) => {
                              const updated = [...newDays]
                              updated[dIdx].exercises[eIdx].reps = e.target.value
                              setNewDays(updated)
                            }}
                            className="bg-[#070714] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono font-bold"
                          />
                          <button
                            onClick={() => {
                              const updated = [...newDays]
                              updated[dIdx].exercises = updated[dIdx].exercises.filter((_, idx) => idx !== eIdx)
                              setNewDays(updated)
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-400 text-center cursor-pointer"
                          >
                            <X className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          const updated = [...newDays]
                          updated[dIdx].exercises.push({
                            exerciseName: 'New Exercise',
                            muscleGroup: 'Chest',
                            sets: 3,
                            reps: '8-12',
                            weightKg: 20,
                            notes: '',
                          })
                          setNewDays(updated)
                        }}
                        className="text-xs font-mono text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm bài tập
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setNewDays([
                      ...newDays,
                      {
                        dayName: `Day ${newDays.length + 1}: NEW DAY`,
                        exercises: [{ exerciseName: 'New Exercise', muscleGroup: 'Chest', sets: 3, reps: '10', weightKg: 20, notes: '' }],
                      },
                    ])
                  }}
                  className="w-full py-3 border border-dashed border-amber-400/40 rounded-2xl text-amber-400 font-mono text-xs font-bold hover:bg-amber-400/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> THÊM NGÀY TẬP MỚI IN GIÁO ÁN
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/80">
              <button
                onClick={() => setIsCreatingRoutine(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-bold text-xs hover:bg-slate-900 cursor-pointer"
              >
                HỦY BỎ
              </button>
              <button
                onClick={() => {
                  const customRoutineObj: ParsedRoutine = {
                    routineName: newRoutineName.trim() || 'My Personal Routine',
                    days: newDays,
                  }
                  setImportedRoutine(customRoutineObj)
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('aura_custom_routine', JSON.stringify(customRoutineObj))
                  }
                  setIsCreatingRoutine(false)
                  alert(`Đã tạo thành công lịch tập cá nhân: ${customRoutineObj.routineName}!`)
                }}
                className="px-6 py-3 btn-aura-gold text-black font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl cursor-pointer"
              >
                LƯU &amp; ÁP DỤNG LỊCH TẬP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
