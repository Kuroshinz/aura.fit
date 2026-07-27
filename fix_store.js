const fs = require('fs');
const file = 'd:/Nexus/src/store/use-workout-store.ts';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  "import { getCurrentSessionEmail, saveAccountData } from '@/lib/utils/account-db'",
  "import { syncWorkoutStateToCloud } from '@/lib/supabase/workout-sync'"
);

// We need to replace instances of saveAccountData with syncWorkoutStateToCloud
c = c.replace(/if \(typeof window !== 'undefined'\) \{\s*const email = getCurrentSessionEmail\(\)\s*if \(email\) saveAccountData\(email, \{ activeWorkout: ([a-zA-Z0-9_]+) \}\)\s*\}/g, 'syncWorkoutStateToCloud({ active_workout: $1 })');

c = c.replace(/if \(typeof window !== 'undefined'\) \{\s*const currentEmail = getCurrentSessionEmail\(\)\s*if \(currentEmail\) \{\s*saveAccountData\(currentEmail, \{\s*workoutHistory: ([a-zA-Z0-9_]+),\s*activeWorkout: null,\s*\}\)\s*\}\s*\}/g, 'syncWorkoutStateToCloud({ workout_history: $1, active_workout: null })');

// For savePersonalRecord, we need to add the sync
c = c.replace(
  /savePersonalRecord: \(exerciseName, weight, reps, oneRM\) => \{\s*const \{ personalRecords \} = get\(\)\s*set\(\{\s*personalRecords: \{\s*\.\.\.personalRecords,\s*\[exerciseName\]: \{ weight, reps, oneRM, date: new Date\(\)\.toISOString\(\) \}\s*\}\s*\}\)/g,
  `savePersonalRecord: (exerciseName, weight, reps, oneRM) => {\n        const { personalRecords } = get()\n        const newPRs = {\n          ...personalRecords,\n          [exerciseName]: { weight, reps, oneRM, date: new Date().toISOString() }\n        }\n        set({ personalRecords: newPRs })\n        syncWorkoutStateToCloud({ personal_records: newPRs })`
);

fs.writeFileSync(file, c, 'utf8');
console.log('Replaced local DB syncs with Supabase sync');
