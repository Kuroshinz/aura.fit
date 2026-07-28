const fs = require('fs');
let c = fs.readFileSync('d:/Nexus/src/app/(dashboard)/routines/page.tsx', 'utf8');

// 1. Add CheckCircle to imports
c = c.replace(
  "import { FileSpreadsheet, Upload, Play, Calendar, Eye, Download, PlusCircle, Trash2, X, Plus, Send, CheckCircle, Loader2, Edit3, Save } from 'lucide-react'",
  "import { FileSpreadsheet, Upload, Play, Calendar, Eye, Download, PlusCircle, Trash2, X, Plus, Send, CheckCircle, Loader2, Edit3, Save, CheckCircle2 } from 'lucide-react'"
);

// 2. Add isDayCompletedToday helper inside RoutinesPage component
const helperCode = `  const { startWorkout, addExerciseToWorkout, workoutHistory } = useWorkoutStore()
  
  const isDayCompletedToday = (dayName: string) => {
    const today = new Date().toDateString()
    return workoutHistory.some((w) => {
      const wDate = new Date(w.start_time).toDateString()
      return wDate === today && w.routine_name.toUpperCase().includes(dayName.toUpperCase())
    })
  }`;

c = c.replace('const { startWorkout, addExerciseToWorkout } = useWorkoutStore()', helperCode);

// 3. Update "TẬP NGAY BÀI HÔM NAY" button logic
const todayButtonCode = `{isDayCompletedToday(todayMatchedDay.dayName) ? (
                  <button
                    disabled
                    className="px-8 py-4 bg-slate-800 text-slate-500 font-black rounded-2xl text-base flex items-center justify-center gap-3 border border-slate-700 cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ĐÃ HOÀN THÀNH HÔM NAY
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartDaySession(todayMatchedDay.dayName, todayMatchedDay.exercises)}
                    className="px-8 py-4 btn-aura-gold text-black font-black rounded-2xl text-base flex items-center justify-center gap-3 shadow-2xl"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    TẬP NGAY BÀI HÔM NAY ({todaySchedule.suggestedDayKey})
                  </button>
                )}`;

c = c.replace(/<button\s+onClick=\{\(\) => handleStartDaySession\(todayMatchedDay\.dayName, todayMatchedDay\.exercises\)\}[\s\S]*?<\/button>/, todayButtonCode);

// 4. Update "BẮT ĐẦU" button in list logic
const startButtonCode = `{!isEditing && (
                    <div className="flex items-center gap-3">
                      {isDayCompletedToday(day.dayName) ? (
                        <span className="px-5 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold rounded-2xl text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> ĐÃ TẬP XONG
                        </span>
                      ) : (
                        <button
                          onClick={() => handleStartDaySession(day.dayName, day.exercises)}
                          className="px-6 py-3.5 btn-aura-gold text-black font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2"
                        >
                          <Play className="w-5 h-5 fill-current" />
                          BẮT ĐẦU
                        </button>
                      )}
                    </div>
                  )}`;

c = c.replace(/<button\s+onClick=\{\(\) => handleStartDaySession\(day\.dayName, day\.exercises\)\}[\s\S]*?<\/button>/, startButtonCode);

fs.writeFileSync('d:/Nexus/src/app/(dashboard)/routines/page.tsx', c, 'utf8');
console.log('Routines page updated.');
