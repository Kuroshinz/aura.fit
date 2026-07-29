export const EXERCISE_TYPES = {
  COMPOUND: 'Compound',
  ISOLATION: 'Isolation',
  CARDIO: 'Cardio',
  PLYOMETRIC: 'Plyometric',
  STRETCHING: 'Stretching',
} as const;

export type ExerciseType = (typeof EXERCISE_TYPES)[keyof typeof EXERCISE_TYPES];

export const EQUIPMENT = {
  BARBELL: 'Barbell',
  DUMBBELL: 'Dumbbell',
  CABLE: 'Cable',
  MACHINE: 'Machine',
  BODYWEIGHT: 'Bodyweight',
  KETTLEBELL: 'Kettlebell',
  RESISTANCE_BAND: 'Resistance Band',
  SMITH_MACHINE: 'Smith Machine',
  EZ_BAR: 'EZ Bar',
  TRAP_BAR: 'Trap Bar',
  CARDIO_EQUIPMENT: 'Cardio Equipment',
  OTHER: 'Other',
} as const;

export type Equipment = (typeof EQUIPMENT)[keyof typeof EQUIPMENT];

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
} as const;

export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[keyof typeof DIFFICULTY_LEVELS];

export interface ExerciseMetadata {
  videoUrl?: string;
  thumbnailUrl?: string;
  instructions?: string[];
  tips?: string[];
  commonMistakes?: string[];
  musclesWorked?: {
    primary: string[];
    secondary?: string[];
  };
}
