const fs = require('fs');
let c = fs.readFileSync('d:/Nexus/src/app/(dashboard)/layout.tsx', 'utf8');

if (!c.includes('import { useExerciseStore }')) {
  c = c.replace(
    "import { useWorkoutStore } from '@/store/use-workout-store'",
    "import { useWorkoutStore } from '@/store/use-workout-store'\nimport { useExerciseStore } from '@/store/useExerciseStore'"
  );
}

const target = "// Hydrate workout history & PRs";
if (c.includes(target) && !c.includes('useExerciseStore.setState')) {
  const replaceStr = `// Hydrate all state\n            if (profileData.exercise_state) {\n              useExerciseStore.setState({\n                favoriteExerciseIds: profileData.exercise_state.favoriteExerciseIds || [],\n                recentlyViewedIds: profileData.exercise_state.recentlyViewedIds || [],\n                customExercises: profileData.exercise_state.customExercises || []\n              })\n            }\n            // Hydrate workout history\n            useWorkoutStore.setState({\n              workoutHistory: profileData.workout_history || [],\n              personalRecords: profileData.personal_records || {},\n              activeWorkout: profileData.active_workout || null,\n            })`;
  c = c.replace(/\/\/ Hydrate workout history & PRs[\s\S]*?\}\)/, replaceStr);
}

fs.writeFileSync('d:/Nexus/src/app/(dashboard)/layout.tsx', c, 'utf8');
console.log('Layout updated.');
