import { getWorkoutSplitById } from '@/data/workout-splits'

/**
 * Maps Javascript Date.getDay() (0 = Sunday, 1 = Monday... 6 = Saturday)
 * to routine day names based on the user's selected split plan.
 * Returns the exact split target name (e.g. "Push", "Upper A", "Rest")
 */
export function getTodayWorkoutMapping(splitId: string = 'ppl_ul_5d'): {
  dayOfWeekName: string
  dateFormatted: string
  suggestedDayKey: string
} {
  const now = new Date()
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  
  const dayIndex = now.getDay() // 0-6 (Sunday is 0)
  const dayOfWeekName = daysOfWeek[dayIndex]
  
  // Format DD/MM/YYYY
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const dateFormatted = `${dayOfWeekName}, ${day}/${month}/${year}`

  // Fetch standard schedule array from JSON configuration
  const split = getWorkoutSplitById(splitId)
  
  // By default, most schedules start on Monday. 
  // In JS, Monday is 1, Sunday is 0.
  // We map index 1 (Monday) -> array[0]
  // index 2 (Tuesday) -> array[1]
  // index 0 (Sunday) -> array[6]
  const mappedArrayIndex = dayIndex === 0 ? 6 : dayIndex - 1

  let suggestedDayKey = 'Rest'
  
  if (split && split.schedule && split.schedule.length === 7) {
    suggestedDayKey = split.schedule[mappedArrayIndex]
  }

  return {
    dayOfWeekName,
    dateFormatted,
    suggestedDayKey
  }
}
