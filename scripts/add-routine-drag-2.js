// Bổ sung drag functions — chèn đúng anchor đã xác minh
const fs = require('fs');
const p = 'd:/Nexus/src/app/(dashboard)/routines/page.tsx';
let s = fs.readFileSync(p, 'utf8');

const anchor = `    const todayMatchedDay = importedRoutine.schedule_data.days.find((d: any) =>`;
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
  console.log('2. Added drag functions OK');
} else {
  console.log('2. WARN: anchor STILL not found');
}

fs.writeFileSync(p, s, 'utf8');
const check = fs.readFileSync(p, 'utf8');
console.log('Co moveExercise:', check.includes('moveExercise') ? 'YES' : 'NO');
console.log('Co dragDayIndex:', check.includes('dragDayIndex') ? 'YES' : 'NO');
console.log('Mojibake:', (check.match(/Ã|â€|Â|â™/g) || []).length);
console.log('GripVertical:', (check.match(/GripVertical/g) || []).length);
