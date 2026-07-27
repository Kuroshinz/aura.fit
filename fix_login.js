const fs = require('fs');
let c = fs.readFileSync('d:/Nexus/src/app/(auth)/login/page.tsx', 'utf8');

if (!c.includes('import { useExerciseStore }')) {
  c = c.replace(
    "import { useWorkoutStore } from '@/store/use-workout-store'",
    "import { useWorkoutStore } from '@/store/use-workout-store'\nimport { useExerciseStore } from '@/store/useExerciseStore'"
  );
}

const target = "useWorkoutStore.setState({";
if (c.includes(target) && !c.includes('useExerciseStore.setState')) {
  const replaceStr = `if (profileData.exercise_state) {\n          useExerciseStore.setState({\n            favoriteExerciseIds: profileData.exercise_state.favoriteExerciseIds || [],\n            recentlyViewedIds: profileData.exercise_state.recentlyViewedIds || [],\n            customExercises: profileData.exercise_state.customExercises || []\n          })\n        }\n        useWorkoutStore.setState({`;
  c = c.replace("useWorkoutStore.setState({", replaceStr);
}

fs.writeFileSync('d:/Nexus/src/app/(auth)/login/page.tsx', c, 'utf8');
console.log('Login updated.');
