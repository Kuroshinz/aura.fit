import { CompletedWorkout } from '@/store/use-workout-store'

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

// Export routine as Excel-compatible CSV (used by routines page)
export function exportRoutineToExcel(routineName: string, exercises: { name: string; sets: { weight: number; reps: number }[] }[]) {
  if (!exercises || exercises.length === 0) {
    alert('Không có bài tập nào để xuất.')
    return
  }

  const rows: string[][] = []
  rows.push(['Bài tập', 'Set', 'Weight (kg)', 'Reps'])

  exercises.forEach((ex, idx) => {
    ex.sets.forEach((set, sIdx) => {
      rows.push([idx === 0 ? ex.name : '', `Set ${sIdx + 1}`, String(set.weight), String(set.reps)])
    })
  })

  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `AURA_Routine_${routineName.replace(/\s+/g, '_')}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
