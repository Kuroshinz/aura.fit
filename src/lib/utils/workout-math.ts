/**
 * Estimated 1Rep Max formula (Epley Formula): 1RM = Weight * (1 + Reps / 30)
 */
export function calculate1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0
  if (reps === 1) return weightKg
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10
}

/**
 * Calculate total volume for a list of sets: Volume = sum(Weight * Reps)
 */
export function calculateTotalVolume(sets: { weight_kg: number; reps: number; is_completed: boolean }[]): number {
  return sets
    .filter((s) => s.is_completed)
    .reduce((sum, s) => sum + s.weight_kg * s.reps, 0)
}
