import * as XLSX from 'xlsx'

export interface ExcelExerciseRow {
  dayName: string
  exerciseName: string
  muscleGroup: string
  sets: number
  reps: string | number
  weightKg?: number | string
  notes?: string
}

export interface ParsedRoutine {
  routineName: string
  days: {
    dayName: string
    exercises: {
      exerciseName: string
      muscleGroup: string
      sets: number
      reps: string | number
      weightKg: number | string
      notes: string
    }[]
  }[]
}

const MUSCLE_MAP: Record<string, string> = {
  // Chest
  'bench press': 'Chest',
  'incline db press': 'Chest',
  'pec deck': 'Chest',
  'machine chest press': 'Chest',
  'incline machine press': 'Chest',

  // Back
  'lat pulldown': 'Back',
  'chest supported row': 'Back',
  'seated cable row': 'Back',
  'seated row machine': 'Back',
  'barbell row': 'Back',
  'pull ups': 'Back',

  // Shoulders
  'machine shoulder press': 'Shoulders',
  'lateral raise': 'Shoulders',
  'rear delt fly': 'Shoulders',
  'overhead press': 'Shoulders',

  // Arms
  'cable tricep extension': 'Arms',
  'db curl': 'Arms',
  'rope hammer curl': 'Arms',
  'cable curl': 'Arms',
  'tricep extension': 'Arms',
  'bicep curl': 'Arms',

  // Legs
  'leg press': 'Legs',
  'lying leg curl': 'Legs',
  'leg extension': 'Legs',
  'hip abduction machine': 'Legs',
  'standing calf raise': 'Legs',
  'hack squat': 'Legs',
  'barbell squat': 'Legs',

  // Core
  'cable crunch': 'Core',
}

export function parseExcelRoutine(fileBuffer: ArrayBuffer): ParsedRoutine {
  const workbook = XLSX.read(fileBuffer, { type: 'array' })

  // Find sheet containing routine data (e.g. 'Routine + Tracker' or first sheet)
  const targetSheetName = workbook.SheetNames.find(
    (name) => name.toLowerCase().includes('routine') || name.toLowerCase().includes('tracker')
  ) || workbook.SheetNames[0]

  const worksheet = workbook.Sheets[targetSheetName]
  const jsonData = XLSX.utils.sheet_to_json<any>(worksheet)

  const dayMap = new Map<string, any[]>()

  jsonData.forEach((row) => {
    const day = row['Day'] || row['Ngày'] || row['Day Name'] || row['Lịch'] || 'Giáo án'
    const exercise = row['Exercise'] || row['Bài tập'] || row['Bài'] || ''
    if (!exercise) return

    const sets = parseInt(row['Sets'] || row['Set'] || row['Số set'] || '3')
    const reps = row['Reps'] || row['Rep'] || row['Số rep'] || '8-10'
    const weight = row['Current kg'] || row['Weight'] || row['Weight (kg)'] || row['Mức tạ'] || '0'
    const notes = row['Notes'] || row['Ghi chú'] || row['Note'] || ''

    // Detect muscle group automatically from name if not present
    let muscleGroup = row['Muscle'] || row['Nhóm cơ'] || row['Muscle Group'] || ''
    if (!muscleGroup) {
      const lowerEx = exercise.toLowerCase().trim()
      muscleGroup = MUSCLE_MAP[lowerEx] || 'General'
    }

    if (!dayMap.has(day)) {
      dayMap.set(day, [])
    }

    dayMap.get(day)?.push({
      exerciseName: exercise,
      muscleGroup,
      sets,
      reps,
      weightKg: weight,
      notes,
    })
  })

  const days = Array.from(dayMap.entries()).map(([dayName, exercises]) => ({
    dayName,
    exercises,
  }))

  return {
    routineName: 'PPL-UL MASTER v7 (Nạp từ GymOS Excel)',
    days,
  }
}
