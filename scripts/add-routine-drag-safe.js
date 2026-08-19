// Thêm drag-drop vào routines/page.tsx — CHỈ DÙNG ASCII, tránh hỏng encoding
// File đã được khôi phục từ commit sạch 22a9279
const fs = require('fs');
const p = 'd:/Nexus/src/app/(dashboard)/routines/page.tsx';
let s = fs.readFileSync(p, 'utf8');

// 1. Thêm icons vào import lucide-react (dòng 9)
const iconLine = "import { FileSpreadsheet, Upload, Play, Calendar, Eye, Download, PlusCircle, Trash2, X, Plus, Send, CheckCircle, Loader2, Edit3, Save, CheckCircle2, History, Clock, Flame, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'";
const newIconLine = "import { FileSpreadsheet, Upload, Play, Calendar, Eye, Download, PlusCircle, Trash2, X, Plus, Send, CheckCircle, Loader2, Edit3, Save, CheckCircle2, History, Clock, Flame, ChevronRight, ChevronDown, ChevronUp, GripVertical, ArrowUp, ArrowDown, ChevronsUp } from 'lucide-react'";
if (s.includes(iconLine)) {
  s = s.replace(iconLine, newIconLine);
  console.log('1. Added drag icons import');
} else {
  console.log('1. WARN: icon import line not found');
}

// 2. Thêm drag state + functions sau deleteExercise (trước todayMatchedDay)
const anchor = `  const todayMatchedDay = importedRoutine?.schedule_data.days.find((d: any) =>`;
const dragCode = `  // ==================== KEO THA SAP XEP BAI TAP (auto-save) ====================
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

`;
if (s.includes(anchor)) {
  s = s.replace(anchor, dragCode + anchor);
  console.log('2. Added drag state + functions');
} else {
  console.log('2. WARN: anchor not found');
}

// 3. Thêm cột THU TU trong thead (trước cột XOA)
const xoaTh = `{isEditing && <th className="pb-3 px-3 text-center">XÓA</th>}`;
if (s.includes(xoaTh)) {
  s = s.replace(xoaTh, `{isEditing && <th className="pb-3 px-3 text-center">THỨ TỰ</th>}
                        {isEditing && <th className="pb-3 px-3 text-center">XÓA</th>}`);
  console.log('3. Added THU TU column header');
} else {
  console.log('3. WARN: XOA th not found');
}

// 4. Thêm drag UI td vào đầu mỗi dòng bài tập
const trStart = `<tr key={eIdx} className="hover:bg-slate-900/60 transition-colors">`;
const dragTd = `<tr key={eIdx} className={\`hover:bg-slate-900/60 transition-colors \${dragExIndex === eIdx && dragDayIndex === idx ? 'opacity-50 bg-slate-900' : ''}\`}>
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
                          )}`;
if (s.includes(trStart)) {
  s = s.replace(trStart, dragTd);
  console.log('4. Added drag UI to rows');
} else {
  console.log('4. WARN: tr start not found');
}

fs.writeFileSync(p, s, 'utf8');
console.log('✅ Done — file saved');

// Verify: không có mojibake mới
const check = fs.readFileSync(p, 'utf8');
const mojibake = (check.match(/Ã|â€|Â|â™/g) || []).length;
console.log('Mojibake check:', mojibake);
console.log('Co GripVertical:', check.includes('GripVertical') ? 'YES' : 'NO');
console.log('Co moveExercise:', check.includes('moveExercise') ? 'YES' : 'NO');
console.log('Dong 158:', check.split('\n')[157]?.slice(0, 60));
