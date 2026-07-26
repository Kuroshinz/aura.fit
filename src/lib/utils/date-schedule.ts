/**
 * Maps Javascript Date.getDay() (0 = Sunday, 1 = Monday... 6 = Saturday)
 * to routine day names (PUSH, PULL, LEGS, UPPER, LOWER, REST)
 */
export function getTodayWorkoutMapping(): {
  dayOfWeekName: string
  dateFormatted: string
  suggestedDayKey: string
} {
  const now = new Date()
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  
  const dayIndex = now.getDay() // 0-6
  const dayOfWeekName = daysOfWeek[dayIndex]
  
  // Format DD/MM/YYYY
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const dateFormatted = `${dayOfWeekName}, ${day}/${month}/${year}`

  // Standard PPL-UL 5 Day Schedule Mapping:
  // Thứ 2: PUSH
  // Thứ 3: PULL
  // Thứ 4: LEGS
  // Thứ 5: NGHỈ / REST
  // Thứ 6: UPPER
  // Thứ 7: LOWER
  // Chủ Nhật: NGHỈ / REST
  let suggestedDayKey = 'PUSH'
  switch (dayIndex) {
    case 1: // Monday
      suggestedDayKey = 'PUSH'
      break
    case 2: // Tuesday
      suggestedDayKey = 'PULL'
      break
    case 3: // Wednesday
      suggestedDayKey = 'LEGS'
      break
    case 4: // Thursday
      suggestedDayKey = 'REST'
      break
    case 5: // Friday
      suggestedDayKey = 'UPPER'
      break
    case 6: // Saturday
      suggestedDayKey = 'LOWER'
      break
    case 0: // Sunday
      suggestedDayKey = 'REST'
      break
  }

  return {
    dayOfWeekName,
    dateFormatted,
    suggestedDayKey,
  }
}
