import * as XLSX from 'xlsx'

export function exportWorkoutDataCSV() {
  const dummyLogs = [
    { Date: '2026-07-24', Routine: 'Push Day', Exercise: 'Bench Press', Sets: 4, Reps: 8, WeightKg: 70, Volume: 2240 },
    { Date: '2026-07-24', Routine: 'Push Day', Exercise: 'Incline DB Press', Sets: 3, Reps: 10, WeightKg: 24, Volume: 720 },
    { Date: '2026-07-23', Routine: 'Pull Day', Exercise: 'Lat Pulldown', Sets: 4, Reps: 10, WeightKg: 55, Volume: 2200 },
    { Date: '2026-07-23', Routine: 'Pull Day', Exercise: 'Barbell Row', Sets: 3, Reps: 8, WeightKg: 60, Volume: 1440 },
  ]

  const headers = ['Date', 'Routine', 'Exercise', 'Sets', 'Reps', 'WeightKg', 'Volume']
  const csvRows = [
    headers.join(','),
    ...dummyLogs.map((row) => `${row.Date},"${row.Routine}","${row.Exercise}",${row.Sets},${row.Reps},${row.WeightKg},${row.Volume}`),
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

// Export Routine Schedule to Excel .XLSX
export function exportRoutineToExcel(routineName: string, days: any[]) {
  const wb = XLSX.utils.book_new()

  // Sheet 1: Routine Tracker Rows
  const routineRows: any[] = []

  days.forEach((day) => {
    day.exercises.forEach((ex: any) => {
      routineRows.push({
        'Day': day.dayName,
        'Exercise': ex.exerciseName,
        'Muscle': ex.muscleGroup,
        'Sets': ex.sets,
        'Reps': ex.reps,
        'Current kg': ex.weightKg,
        'Notes': ex.notes || '',
      })
    })
  })

  const ws = XLSX.utils.json_to_sheet(routineRows)
  XLSX.utils.book_append_sheet(wb, ws, 'Routine + Tracker')

  // Generate and Download .XLSX File
  XLSX.writeFile(wb, `${routineName.replace(/[^a-zA-Z0-9]/g, '_')}_GymOS.xlsx`)
}
