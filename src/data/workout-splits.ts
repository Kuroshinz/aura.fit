export interface WorkoutSplit {
  id: string;
  name: string;
  days_per_week: number;
  frequency_per_muscle_group: number;
  experience_level: string;
  recovery_demand: string;
  schedule: string[];
}

export const WORKOUT_SPLITS: WorkoutSplit[] = [
  {
    id: "full_body_3d",
    name: "Full Body 3 Days",
    days_per_week: 3,
    frequency_per_muscle_group: 3,
    experience_level: "Beginner",
    recovery_demand: "Low",
    schedule: ["Full Body A", "Rest", "Full Body B", "Rest", "Full Body C", "Rest", "Rest"]
  },
  {
    id: "upper_lower_4d",
    name: "UL-UL (Upper Lower 4 Days)",
    days_per_week: 4,
    frequency_per_muscle_group: 2,
    experience_level: "Intermediate",
    recovery_demand: "Medium",
    schedule: ["Upper A", "Lower A", "Rest", "Upper B", "Lower B", "Rest", "Rest"]
  },
  {
    id: "ppl_ul_5d",
    name: "PPL-UL (5 Days Split)",
    days_per_week: 5,
    frequency_per_muscle_group: 2,
    experience_level: "Intermediate-Advanced",
    recovery_demand: "High",
    schedule: ["Push", "Pull", "Legs", "Rest", "Upper", "Lower", "Rest"]
  },
  {
    id: "ppl_ppl_6d",
    name: "PPL-PPL (6 Days Split)",
    days_per_week: 6,
    frequency_per_muscle_group: 2,
    experience_level: "Advanced",
    recovery_demand: "Very High",
    schedule: ["Push A", "Pull A", "Legs A", "Push B", "Pull B", "Legs B", "Rest"]
  },
  {
    id: "arnold_6d",
    name: "Arnold Split",
    days_per_week: 6,
    frequency_per_muscle_group: 2,
    experience_level: "Intermediate-Advanced",
    recovery_demand: "Very High",
    schedule: ["Chest/Back", "Shoulders/Arms", "Legs/Abs", "Chest/Back", "Shoulders/Arms", "Legs/Abs", "Rest"]
  },
  {
    id: "bro_split_5d",
    name: "Bro Split (Body Part)",
    days_per_week: 5,
    frequency_per_muscle_group: 1,
    experience_level: "Intermediate",
    recovery_demand: "Medium",
    schedule: ["Chest", "Back", "Shoulders", "Legs", "Arms", "Rest", "Rest"]
  }
];

export function getWorkoutSplitById(id: string): WorkoutSplit | undefined {
  return WORKOUT_SPLITS.find(split => split.id === id);
}
