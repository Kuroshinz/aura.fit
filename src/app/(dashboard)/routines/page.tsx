'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { parseExcelRoutine, ParsedRoutine } from '@/lib/utils/excel-parser'
import { getTodayWorkoutMapping } from '@/lib/utils/date-schedule'
import { exportRoutineToExcel } from '@/lib/utils/export-data'
import { sendTelegramWebhook } from '@/lib/telegram-webhook'
import { FileSpreadsheet, Upload, Play, Calendar, Eye, Download, PlusCircle, Trash2, X, Plus, Send, CheckCircle, Loader2, Edit3, Save, CheckCircle2, History, Clock, Flame, ChevronRight, ChevronDown, ChevronUp, GripVertical, ArrowUp, ArrowDown, ChevronsUp } from 'lucide-react'
import { useWorkoutStore } from '@/store/use-workout-store'
import { useProfileStore } from '@/store/use-profile-store'
import { WORKOUT_SPLITS } from '@/data/workout-splits'
import { getActiveRoutine, saveRoutine, updateRoutine, deleteRoutine, UserRoutine } from '@/lib/supabase/routine-service'
import { motion, AnimatePresence } from 'framer-motion'

export default function RoutinesPage() {
  const { profile } = useProfileStore()
  const [importedRoutine, setImportedRoutine] = useState<UserRoutine | null>(null)
  const [showFullSchedule, setShowFullSchedule] = useState(false)
  const [todaySchedule, setTodaySchedule] = useState<any>(null)
  const [sendingTeleRoutine, setSendingTeleRoutine] = useState(false)
  const [selectedSplitId, setSelectedSplitId] = useState('ppl_ul_5d')
  const [isLoading, setIsLoading] = useState(true)

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false)
  const [editableRoutine, setEditableRoutine] = useState<UserRoutine | null>(null)

  // Workout History Expansion State
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<string[]>([])

  const { startWorkout, addExerciseToWorkout, workoutHistory } = useWorkoutStore()
  const router = useRouter()

  const isDayCompletedToday = (dayName: string) => {
    const today = new Date().toDateString()
    return workoutHistory.some((w) => {
      const wDate = new Date(w.start_time).toDateString()
      return wDate === today && w.routine_name.toUpperCase().includes(dayName.toUpperCase())
    })
  }

  const toggleHistoryExpand = (id: string) => {
    setExpandedHistoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const loadActiveRoutine = async () => {
    setIsLoading(true)
    const active = await getActiveRoutine()
    if (active) {
      setImportedRoutine(active)
      setEditableRoutine(JSON.parse(JSON.stringify(active))) // deep copy
      setSelectedSplitId(active.split_id)
      const todayInfo = getTodayWorkoutMapping(active.split_id)
      setTodaySchedule(todayInfo)
    } else {
      setImportedRoutine(null)
      setEditableRoutine(null)
      const todayInfo = getTodayWorkoutMapping('ppl_ul_5d')
      setTodaySchedule(todayInfo)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadActiveRoutine()
  }, [])

  // Auto-send today's routine to Telegram on page load (once per day)
  useEffect(() => {
    if (!importedRoutine || !todaySchedule || !profile) return
    if (todaySchedule.suggestedDayKey === 'Rest') return // Skip rest days
    if (!profile.telegram_chat_id) return // No Telegram configured
    if (!profile.auto_send_routine) return // Auto-send disabled

    const todayStr = new Date().toDateString()
    const storageKey = 'aura_last_auto_send_date'
    const lastSent = localStorage.getItem(storageKey)
    if (lastSent === todayStr) return // Already sent today

    const todayMatchedDay = importedRoutine.schedule_data.days.find((d: any) =>
      d.dayName?.toLowerCase().replace(/\s+/g, '') === todaySchedule.suggestedDayKey?.toLowerCase().replace(/\s+/g, '')
    )
    if (!todayMatchedDay) return

    const exListText = todayMatchedDay.exercises.map((e: any) => `â€¢ ${e.exerciseName} (${e.sets} sets x ${e.reps})`).join('\\n')
    sendTelegramWebhook({
      event_type: 'routine_scheduled',
      user_email: `${(profile?.name || 'athlete').toLowerCase().replace(/\\s+/g, '')}@aura.fit`,
      user_name: profile?.name || 'Váº­n Ä‘á»™ng viÃªn AURA',
      title: `ðŸ“‹ Lá»ŠCH Táº¬P HÃ”M NAY: ${todayMatchedDay.dayName}`,
      message: `Lá»‹ch táº­p ngÃ y ${todaySchedule.dateFormatted}:\\n\\n${exListText}`,
      telegram_chat_id: profile?.telegram_chat_id || undefined,
      metrics: {
        'NgÃ y táº­p': todayMatchedDay.dayName,
        'Sá»‘ bÃ i táº­p': todayMatchedDay.exercises.length
      }
    }).then((res) => {
      if (res.success) {
        localStorage.setItem(storageKey, todayStr)
        console.log('âœ… Auto-sent today routine to Telegram')
      }
    }).catch(() => {})
  }, [importedRoutine, todaySchedule, profile])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (evt) => {
      const buffer = evt.target?.result as ArrayBuffer
      try {
        const parsed = parseExcelRoutine(buffer)
        
        // --- VERIFY MAPPING ---
        const splitDef = WORKOUT_SPLITS.find(s => s.id === selectedSplitId)
        if (splitDef && parsed.days.length !== splitDef.days_per_week) {
          alert(`Lá»—i: File Excel cá»§a báº¡n cÃ³ ${parsed.days.length} ngÃ y táº­p, nhÆ°ng Mapping báº¡n chá»n ("${splitDef.name}") yÃªu cáº§u Ä‘Ãºng ${splitDef.days_per_week} ngÃ y! Vui lÃ²ng chá»n Mapping khÃ¡c hoáº·c sá»­a file Excel.`)
          return
        }
        // ----------------------

        setIsLoading(true)
        const res = await saveRoutine(parsed.routineName, parsed, selectedSplitId)
        if (res.success && res.data) {
          alert(`ÄÃ£ náº¡p thÃ nh cÃ´ng file Excel: ${parsed.routineName} vá»›i ${parsed.days.length} ngÃ y táº­p!`)
          loadActiveRoutine() // refresh mapping
        } else {
          alert('Lá»—i lÆ°u lá»‹ch táº­p: ' + res.error)
        }
      } catch (err) {
        alert('File Excel khÃ´ng Ä‘Ãºng Ä‘á»‹nh dáº¡ng. Vui lÃ²ng kiá»ƒm tra cÃ¡c cá»™t!')
      } finally {
        setIsLoading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleExportExcel = () => {
    if (!importedRoutine) return
    exportRoutineToExcel(importedRoutine.name, importedRoutine.schedule_data.days)
  }

  const handleStartDaySession = (dayName: string, exercises: any[]) => {
    startWorkout(importedRoutine?.id || crypto.randomUUID(), dayName)
    exercises.forEach((ex) => {
      addExerciseToWorkout(crypto.randomUUID(), ex.exerciseName, ex.muscleGroup)
    })
    router.push('/workout')
  }

  const handleDeleteRoutine = async () => {
    if (!importedRoutine) return
    if (!confirm('Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a giÃ¡o Ã¡n nÃ y khÃ´ng? ToÃ n bá»™ dá»¯ liá»‡u sáº½ bá»‹ máº¥t.')) return
    setIsLoading(true)
    const success = await deleteRoutine(importedRoutine.id)
    if (success) {
      alert('ÄÃ£ xÃ³a lá»‹ch táº­p thÃ nh cÃ´ng!')
      loadActiveRoutine()
    } else {
      alert('CÃ³ lá»—i xáº£y ra khi xÃ³a lá»‹ch táº­p.')
      setIsLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!editableRoutine) return
    setIsLoading(true)
    const res = await updateRoutine(
      editableRoutine.id,
      editableRoutine.name,
      editableRoutine.schedule_data,
      editableRoutine.split_id
    )
    if (res.success && res.data) {
      setImportedRoutine(res.data)
      setIsEditing(false)
      alert('ÄÃ£ lÆ°u cÃ¡c thay Ä‘á»•i thÃ nh cÃ´ng!')
      loadActiveRoutine()
    } else {
      alert('Lá»—i khi lÆ°u: ' + res.error)
      setIsLoading(false)
    }
  }

  const updateExerciseField = (dayIndex: number, exIndex: number, field: string, value: any) => {
    if (!editableRoutine) return
    const newRoutine = { ...editableRoutine }
    // @ts-ignore
    newRoutine.schedule_data.days[dayIndex].exercises[exIndex][field] = value
    setEditableRoutine(newRoutine)
  }

  const deleteExercise = (dayIndex: number, exIndex: number) => {
    if (!editableRoutine) return
    if (!confirm('XÃ³a bÃ i táº­p nÃ y?')) return
    const newRoutine = { ...editableRoutine }
    newRoutine.schedule_data.days[dayIndex].exercises.splice(exIndex, 1)
    setEditableRoutine(newRoutine)
  }

  // ==================== KÃ‰O THáº¢ Sáº®P Xáº¾P BÃ€I Táº¬P (auto-save) ====================
  const [dragDayIndex, setDragDayIndex] = useState<number | null>(null)
  const [dragExIndex, setDragExIndex] = useState<number | null>(null)

  const persistRoutine = async (newRoutine: any) => {
    if (!newRoutine?.id) return
    setEditableRoutine(newRoutine)
    const res = await updateRoutine(
      newRoutine.id,
      newRoutine.name,
      newRoutine.schedule_data,
      newRoutine.split_id
    )
    if (res.success && res.data) {
      setImportedRoutine(res.data)
    }
  }

  const moveExercise = async (dayIndex: number, fromIdx: number, toIdx: number) => {
    if (!editableRoutine) return
    if (fromIdx === toIdx) return
    const newR = JSON.parse(JSON.stringify(editableRoutine))
    const exercises = newR.schedule_data.days[dayIndex].exercises
    const [moved] = exercises.splice(fromIdx, 1)
    exercises.splice(toIdx, 0, moved)
    await persistRoutine(newR)
  }

  const moveExToTop = async (dayIndex: number, idx: number) => {
    if (idx === 0) return
    await moveExercise(dayIndex, idx, 0)
  }

  const todayMatchedDay = importedRoutine?.schedule_data.days.find((d) =>
    d.dayName.toUpperCase().includes(todaySchedule?.suggestedDayKey.toUpperCase() || 'PUSH')
  ) || importedRoutine?.schedule_data.days[0]

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
            AUTOMATIC CALENDAR SCHEDULER
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Lá»ŠCH Táº¬P HÃ”M NAY
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFullSchedule(!showFullSchedule)}
            className="px-5 py-3.5 aura-glass border-amber-400/50 text-amber-300 font-bold rounded-2xl text-sm flex items-center gap-2 cursor-pointer"
          >
            <Eye className="w-5 h-5" />
            {showFullSchedule ? 'áº¨N FULL Lá»ŠCH' : 'XEM FULL Lá»ŠCH Táº¬P'}
          </button>

          <button
            onClick={handleExportExcel}
            className="px-5 py-3.5 aura-glass border-emerald-400/50 text-emerald-400 font-bold rounded-2xl text-sm flex items-center gap-2 hover:bg-emerald-500/10 transition-all shadow-xl cursor-pointer"
          >
            <Download className="w-5 h-5" />
            XUáº¤T EXCEL
          </button>
        </div>
      </div>

      <div className="glow-divider" />

      {/* Upload & Setup Section */}
      <div className="aura-glass rounded-3xl p-6 border border-amber-400/30">
        <h3 className="text-lg font-bold text-white mb-4">THIáº¾T Láº¬P Lá»ŠCH Táº¬P (UPLOAD EXCEL)</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-full max-w-xs">
            <label className="text-xs font-mono font-bold text-slate-400 uppercase mb-2 block">CHá»ŒN LOáº I SPLIT MAPPING</label>
            <select
              value={selectedSplitId}
              onChange={(e) => setSelectedSplitId(e.target.value)}
              className="w-full bg-[#070714] border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
            >
              {WORKOUT_SPLITS.map((split) => (
                <option key={split.id} value={split.id}>{split.name} ({split.days_per_week} Days)</option>
              ))}
            </select>
          </div>

          <label className="cursor-pointer px-6 py-3.5 mt-6 btn-aura-gold text-black font-extrabold rounded-xl text-sm flex items-center gap-2 shadow-xl shrink-0">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            <span>{isLoading ? 'ÄANG Xá»¬ LÃ...' : 'NHáº¬P FILE EXCEL VÃ€O ÄÃM MÃ‚Y'}</span>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={isLoading} className="hidden" />
          </label>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      )}

      {/* Today's Schedule Section */}
      {todaySchedule && !isLoading && !isEditing && (
        <div className="section-container section-glow-amber rounded-3xl p-6 md:p-8 bg-slate-900/20 border border-amber-400/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-500/20 border border-amber-400 rounded-2xl text-amber-400">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                  THá»œI GIAN HIá»†N Táº I
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">{todaySchedule.dateFormatted}</h2>
              </div>
            </div>

            {importedRoutine && todayMatchedDay && todaySchedule.suggestedDayKey !== 'Rest' && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={async () => {
                    setSendingTeleRoutine(true)
                    const exListText = todayMatchedDay.exercises.map((e: any) => `â€¢ ${e.exerciseName} (${e.sets} sets x ${e.reps})`).join('\n')
                    const res = await sendTelegramWebhook({
                      event_type: 'workout_completed',
                      user_email: `${(profile?.name || 'athlete').toLowerCase().replace(/\s+/g, '')}@aura.fit`,
                      user_name: profile?.name || 'Váº­n Ä‘á»™ng viÃªn AURA',
                      title: `ðŸ“‹ Lá»ŠCH Táº¬P HÃ”M NAY: ${todayMatchedDay.dayName}`,
                      message: `Lá»‹ch táº­p ngÃ y ${todaySchedule.dateFormatted}:\n\n${exListText}`,
                      telegram_chat_id: profile?.telegram_chat_id || undefined,
                      metrics: {
                        'NgÃ y táº­p': todayMatchedDay.dayName,
                        'Sá»‘ bÃ i táº­p': todayMatchedDay.exercises.length
                      }
                    })
                    setSendingTeleRoutine(false)
                    if (res.success) {
                      alert(`ÄÃ£ gá»­i lá»‹ch táº­p "${todayMatchedDay.dayName}" sang Telegram thÃ nh cÃ´ng!`)
                    } else {
                      alert(res.error || 'Lá»—i khi gá»­i lá»‹ch táº­p')
                    }
                  }}
                  disabled={sendingTeleRoutine}
                  className="px-5 py-4 aura-glass border-cyan-400/50 text-cyan-300 font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-cyan-500/10 transition-all shadow-xl disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-5 h-5 text-cyan-400" />
                  {sendingTeleRoutine ? 'ÄANG Gá»¬I...' : 'Gá»¬I Lá»ŠCH SANG TELEGRAM'}
                </button>

                {isDayCompletedToday(todayMatchedDay.dayName) ? (
                  <button
                    disabled
                    className="px-8 py-4 bg-slate-800 text-slate-500 font-black rounded-2xl text-base flex items-center justify-center gap-3 border border-slate-700 cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ÄÃƒ HOÃ€N THÃ€NH HÃ”M NAY
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartDaySession(todayMatchedDay.dayName, todayMatchedDay.exercises)}
                    className="px-8 py-4 btn-aura-gold text-black font-black rounded-2xl text-base flex items-center justify-center gap-3 shadow-2xl"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    Táº¬P NGAY BÃ€I HÃ”M NAY ({todaySchedule.suggestedDayKey})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Today Exercises Preview */}
          {!importedRoutine ? (
            <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-700 text-center">
              <p className="text-amber-400 font-bold text-xl mb-1">CHÆ¯A CÃ“ Lá»ŠCH Táº¬P NÃ€O</p>
              <p className="text-sm text-slate-300 font-medium">Vui lÃ²ng táº£i lÃªn file Excel lá»‹ch táº­p cá»§a báº¡n á»Ÿ má»¥c Thiáº¿t Láº­p phÃ­a trÃªn!</p>
            </div>
          ) : todaySchedule.suggestedDayKey === 'Rest' ? (
            <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-700 text-center">
              <p className="text-amber-400 font-bold text-xl mb-1">HÃ”M NAY LÃ€ NGÃ€Y NGHá»ˆ (REST DAY)</p>
              <p className="text-sm text-slate-300 font-medium">Nghá»‰ ngÆ¡i há»“i phá»¥c cÆ¡ báº¯p vÃ  náº¡p Ä‘á»§ Protein!</p>
            </div>
          ) : (
            todayMatchedDay && (
              <div>
                <h3 className="text-lg font-bold text-amber-400 mb-4 uppercase">
                  Lá»‹ch Táº­p Gá»£i Ã ({todaySchedule.suggestedDayKey}): {todayMatchedDay.dayName}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {todayMatchedDay.exercises.map((ex: any, eIdx: number) => (
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
      {(showFullSchedule || !todaySchedule) && importedRoutine && !isLoading && (
        <div className="space-y-6">
          <div className="aura-glass p-6 rounded-3xl flex items-center justify-between border-amber-400/40">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editableRoutine?.name || ''}
                  onChange={(e) => {
                    if(editableRoutine) setEditableRoutine({...editableRoutine, name: e.target.value})
                  }}
                  className="bg-transparent text-2xl font-extrabold text-white border-b-2 border-amber-400 focus:outline-none w-full max-w-md"
                />
              ) : (
                <h2 className="text-2xl font-extrabold text-white">{importedRoutine.name}</h2>
              )}
              <p className="text-sm font-mono text-amber-300 mt-1 font-bold">
                DANH SÃCH {importedRoutine.schedule_data.days.length} NGÃ€Y Táº¬P (MAPPING: {WORKOUT_SPLITS.find(s => s.id === importedRoutine.split_id)?.name})
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveChanges}
                    className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-all flex items-center gap-2 font-bold text-sm"
                  >
                    <Save className="w-5 h-5" />
                    LÆ¯U
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditableRoutine(JSON.parse(JSON.stringify(importedRoutine)))
                    }}
                    className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 transition-all font-bold text-sm"
                  >
                    Há»¦Y
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-3 bg-indigo-500/20 text-indigo-400 border border-indigo-400 rounded-xl hover:bg-indigo-500/30 transition-all"
                    title="Sá»­a Lá»‹ch Táº­p"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDeleteRoutine}
                    className="p-3 bg-red-500/20 text-red-400 border border-red-400 rounded-xl hover:bg-red-500/30 transition-all"
                    title="XÃ³a Lá»‹ch Táº­p"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {(isEditing ? editableRoutine : importedRoutine)?.schedule_data.days.map((day, idx) => (
              <div key={idx} className="aura-glass rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
                  {isEditing ? (
                    <input
                      value={day.dayName}
                      onChange={(e) => {
                        const newR = { ...editableRoutine! }
                        newR.schedule_data.days[idx].dayName = e.target.value
                        setEditableRoutine(newR)
                      }}
                      className="text-2xl font-extrabold text-amber-400 bg-transparent border-b border-amber-400/50 focus:outline-none"
                    />
                  ) : (
                    <h3 className="text-2xl font-extrabold text-amber-400">{day.dayName}</h3>
                  )}
                  
                  {!isEditing && (
                    <div className="flex items-center gap-3">
                      {isDayCompletedToday(day.dayName) ? (
                        <span className="px-5 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold rounded-2xl text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> ÄÃƒ Táº¬P XONG
                        </span>
                      ) : (
                        <button
                          onClick={() => handleStartDaySession(day.dayName, day.exercises)}
                          className="px-6 py-3.5 btn-aura-gold text-black font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2"
                        >
                          <Play className="w-5 h-5 fill-current" />
                          Báº®T Äáº¦U
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700 text-xs font-mono font-bold text-slate-300 uppercase">
                        <th className="pb-3 px-3">BÃ€I Táº¬P (EXERCISE)</th>
                        <th className="pb-3 px-3">NHÃ“M CÆ </th>
                        <th className="pb-3 px-3 text-center">SETS</th>
                        <th className="pb-3 px-3 text-center">REPS</th>
                        <th className="pb-3 px-3 text-center">Má»¨C Táº </th>
                        <th className="pb-3 px-3">GHI CHÃš</th>
                        {isEditing && <th className="pb-3 px-3 text-center">XÃ“A</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm">
                      {day.exercises.map((ex, eIdx) => (
                        <tr key={eIdx} className={`hover:bg-slate-900/60 transition-colors ${dragExIndex === eIdx && dragDayIndex === idx ? 'opacity-50 bg-slate-900' : ''}`}>
                          {isEditing && (
                            <td className="py-4 px-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <GripVertical
                                  className="w-5 h-5 text-slate-400 cursor-grab active:cursor-grabbing hover:text-amber-400 transition-colors"
                                  draggable
                                  onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDragDayIndex(idx); setDragExIndex(eIdx); }}
                                  onDragOver={(e) => { e.preventDefault(); }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    if (dragDayIndex === idx && dragExIndex !== null && dragExIndex !== eIdx) {
                                      moveExercise(idx, dragExIndex, eIdx);
                                    }
                                    setDragDayIndex(null); setDragExIndex(null);
                                  }}
                                  onDragEnd={() => { setDragDayIndex(null); setDragExIndex(null); }}
                                />
                                <div className="flex flex-col gap-0.5">
                                  <button onClick={() => moveExercise(idx, eIdx, eIdx - 1)} disabled={eIdx === 0} className="text-slate-500 hover:text-amber-400 disabled:opacity-20 transition-colors" title="Lên trên">
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => moveExercise(idx, eIdx, eIdx + 1)} disabled={eIdx === day.exercises.length - 1} className="text-slate-500 hover:text-amber-400 disabled:opacity-20 transition-colors" title="Xuống dưới">
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>
                                <button onClick={() => moveExToTop(idx, eIdx)} disabled={eIdx === 0} className="text-slate-500 hover:text-amber-400 disabled:opacity-20 transition-colors" title="Lên đầu">
                                  <ChevronsUp className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          )}
                          <td className="py-4 px-3 font-bold text-white text-base">
                            {isEditing ? (
                              <input value={ex.exerciseName} onChange={(e) => updateExerciseField(idx, eIdx, 'exerciseName', e.target.value)} className="bg-transparent border-b border-slate-700 w-full focus:outline-none focus:border-amber-400"/>
                            ) : ex.exerciseName}
                          </td>
                          <td className="py-4 px-3">
                            {isEditing ? (
                              <input value={ex.muscleGroup} onChange={(e) => updateExerciseField(idx, eIdx, 'muscleGroup', e.target.value)} className="bg-transparent border-b border-slate-700 w-24 focus:outline-none focus:border-amber-400 text-xs font-mono uppercase text-amber-300"/>
                            ) : (
                              <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-900 text-amber-300 border border-slate-700 rounded-full uppercase">
                                {ex.muscleGroup}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-3 text-center font-mono font-bold text-white text-base">
                            {isEditing ? (
                              <input type="number" value={ex.sets} onChange={(e) => updateExerciseField(idx, eIdx, 'sets', parseInt(e.target.value)||0)} className="bg-transparent border-b border-slate-700 w-12 text-center focus:outline-none focus:border-amber-400"/>
                            ) : ex.sets}
                          </td>
                          <td className="py-4 px-3 text-center font-mono font-bold text-white text-base">
                            {isEditing ? (
                              <input value={ex.reps} onChange={(e) => updateExerciseField(idx, eIdx, 'reps', e.target.value)} className="bg-transparent border-b border-slate-700 w-16 text-center focus:outline-none focus:border-amber-400"/>
                            ) : ex.reps}
                          </td>
                          <td className="py-4 px-3 text-center font-mono font-extrabold text-cyan-300 text-base">
                            {isEditing ? (
                              <input value={ex.weightKg} onChange={(e) => updateExerciseField(idx, eIdx, 'weightKg', e.target.value)} className="bg-transparent border-b border-slate-700 w-16 text-center focus:outline-none focus:border-cyan-400"/>
                            ) : (ex.weightKg || '--')}
                          </td>
                          <td className="py-4 px-3 text-xs text-slate-300 font-medium">
                            {isEditing ? (
                              <input value={ex.notes} onChange={(e) => updateExerciseField(idx, eIdx, 'notes', e.target.value)} className="bg-transparent border-b border-slate-700 w-full focus:outline-none focus:border-amber-400"/>
                            ) : (ex.notes || '---')}
                          </td>
                          {isEditing && (
                            <td className="py-4 px-3 text-center">
                              <button onClick={() => deleteExercise(idx, eIdx)} className="text-red-400 hover:text-red-300 p-1">
                                <X className="w-5 h-5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {isEditing && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => {
                          const newR = { ...editableRoutine! }
                          newR.schedule_data.days[idx].exercises.push({
                            exerciseName: 'BÃ i táº­p má»›i',
                            muscleGroup: 'Chest',
                            sets: 3,
                            reps: '10',
                            weightKg: '--',
                            notes: ''
                          })
                          setEditableRoutine(newR)
                        }}
                        className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 border border-amber-400/30 px-4 py-2 rounded-xl"
                      >
                        <Plus className="w-4 h-4" /> THÃŠM BÃ€I Táº¬P VÃ€O NGÃ€Y NÃ€Y
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPLETED WORKOUT HISTORY SECTION */}
      {workoutHistory.length > 0 && (
        <div className="space-y-6 mt-10">
          <div className="glow-divider" />
          <div className="flex items-center gap-3.5 mb-6">
            <div className="p-3 bg-amber-500/20 border border-amber-400/50 rounded-2xl text-amber-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">Lá»ŠCH Sá»¬ BUá»”I Táº¬P HOÃ€N THÃ€NH</h2>
              <p className="text-xs font-mono text-slate-400 mt-1">Danh sÃ¡ch chi tiáº¿t cÃ¡c buá»•i táº­p báº¡n Ä‘Ã£ hoÃ n thÃ nh</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {workoutHistory.map((w) => {
              const dateObj = new Date(w.start_time)
              const dateStr = `${dateObj.toLocaleDateString('vi-VN', { weekday: 'long' })}, ${dateObj.toLocaleDateString('vi-VN')} lÃºc ${dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
              const isExpanded = expandedHistoryIds.includes(w.id)

              return (
                <div key={w.id} className="aura-glass rounded-3xl p-5 border border-slate-700/60 transition-all space-y-4">
                  <div 
                    onClick={() => toggleHistoryExpand(w.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:opacity-90"
                  >
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase">{dateStr}</span>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                        {w.routine_name}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                      <span className="px-2.5 py-1.5 bg-slate-900 text-slate-200 border border-slate-800 rounded-xl font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {w.duration_minutes} phÃºt
                      </span>
                      <span className="px-2.5 py-1.5 bg-amber-500/10 text-amber-300 border border-amber-400/20 rounded-xl font-bold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> {w.total_volume.toLocaleString()} kg
                      </span>
                      <span className="px-2.5 py-1.5 bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 rounded-xl font-bold">
                        {w.exercises.length} BÃ i táº­p
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-slate-800/80 pt-4"
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
                                    {set.is_completed && <span className="text-emerald-400 font-bold">âœ“ HoÃ n thÃ nh</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
