export const MUSCLE_GROUPS = {
  CHEST: 'Chest',
  BACK: 'Back',
  LEGS: 'Legs',
  SHOULDERS: 'Shoulders',
  ARMS: 'Arms',
  CORE: 'Core',
  FULL_BODY: 'Full Body',
} as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[keyof typeof MUSCLE_GROUPS];

export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  [MUSCLE_GROUPS.CHEST]: '#F59E0B', // Amber
  [MUSCLE_GROUPS.BACK]: '#22D3EE', // Cyan
  [MUSCLE_GROUPS.LEGS]: '#F97316', // Orange
  [MUSCLE_GROUPS.SHOULDERS]: '#A78BFA', // Purple
  [MUSCLE_GROUPS.ARMS]: '#FB923C', // Orange-400
  [MUSCLE_GROUPS.CORE]: '#4ADE80', // Green
  [MUSCLE_GROUPS.FULL_BODY]: '#F8FAFC', // Off-white
};
