import { CompletedWorkout } from '@/store/use-workout-store'
import * as XLSX from 'xlsx'

// Export Workout History to CSV based on real user data
export function exportWorkoutDataCSV(workoutHistory: CompletedWorkout[] = []) {
  if (workoutHistory.length === 0) {
    alert('Không có dữ liệu buổi tập nào để xuất. Hãy tập luyện trước!')
    return
  }

  const rows: { Date: string; Routine: string; Exercise: string; Sets: number; Reps: number; WeightKg: number; Volume: number }[] = []

  workoutHistory.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const totalSets = exercise.sets.length
      const totalReps = exercise.sets.reduce((sum, s) => sum + s.reps, 0)
      const avgWeight = exercise.sets.length > 0
        ? Math.round((exercise.sets.reduce((sum, s) => sum + s.weight_kg, 0) / exercise.sets.length) * 10) / 10
        : 0
      const volume = exercise.sets.filter(s => s.is_completed).reduce((sum, s) => sum + s.weight_kg * s.reps, 0)

      rows.push({
        Date: new Date(workout.start_time).toLocaleDateString('vi-VN'),
        Routine: workout.routine_name || 'Buổi tập tự do',
        Exercise: exercise.exercise_name,
        Sets: totalSets,
        Reps: totalReps,
        WeightKg: avgWeight,
        Volume,
      })
    })
  })

  const headers = ['Date', 'Routine', 'Exercise', 'Sets', 'Reps', 'WeightKg', 'Volume']
  const csvRows = [
    headers.join(','),
    ...rows.map((row) =>
      `"${row.Date}","${row.Routine}","${row.Exercise}",${row.Sets},${row.Reps},${row.WeightKg},${row.Volume}`
    ),
  ]

  const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `AURA_Workout_Logs_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export routine as real Excel .xlsx (used by routines page)
// Nhận schedule_data.days: { dayName: string; exercises: ParsedExercise[] }[]
// ParsedExercise = { exerciseName, muscleGroup, sets, reps, weightKg, notes }
export function exportRoutineToExcel(routineName: string, days: { dayName: string; exercises: { exerciseName: string; sets: number; reps: string | number; weightKg?: string | number }[] }[]) {
  if (!days || days.length === 0) {
    alert('Không có bài tập nào để xuất.')
    return
  }

  const workbook = XLSX.utils.book_new()

  // Sheet 1: Tổng quan từng ngày
  const overviewRows: (string | number)[][] = [['Ngày', 'Bài tập', 'Số Set', 'Tổng Reps']]
  days.forEach((day) => {
    if (!day.exercises) return
    day.exercises.forEach((ex, idx) => {
      const numSets = typeof ex.sets === 'number' ? ex.sets : parseInt(String(ex.sets || '0')) || 0
      const repsStr = String(ex.reps ?? '')
      overviewRows.push([idx === 0 ? day.dayName : '', ex.exerciseName, numSets, repsStr])
    })
  })
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewRows)
  overviewSheet['!cols'] = [{ wch: 20 }, { wch: 40 }, { wch: 10 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Tổng quan')

  // Sheet 2: Chi tiết từng buổi (giống file GymOS)
  days.forEach((day) => {
    if (!day.exercises) return
    const detailRows: (string | number)[][] = [['Bài tập', 'Số Set', 'Reps', 'Weight (kg)']]
    day.exercises.forEach((ex) => {
      const numSets = typeof ex.sets === 'number' ? ex.sets : parseInt(String(ex.sets || '0')) || 0
      detailRows.push([ex.exerciseName, numSets, String(ex.reps ?? ''), String(ex.weightKg ?? '')])
    })
    const sheet = XLSX.utils.aoa_to_sheet(detailRows)
    sheet['!cols'] = [{ wch: 40 }, { wch: 8 }, { wch: 10 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(workbook, sheet, day.dayName.slice(0, 31))
  })

  const safeName = (routineName || 'Routine').replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_')
  XLSX.writeFile(workbook, `AURA_Routine_${safeName}.xlsx`)
}
