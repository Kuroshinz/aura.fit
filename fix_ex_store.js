const fs = require('fs');

let c = fs.readFileSync('d:/Nexus/src/store/useExerciseStore.ts', 'utf8');

c = c.replace(
  "import { EXERCISES_DATABASE } from '@/data/exercises-database';",
  "import { EXERCISES_DATABASE } from '@/data/exercises-database';\nimport { syncStateToCloud } from '@/lib/supabase/user-sync';"
);

c = c.replace(
  /toggleFavorite: \(exerciseId\) =>\s*set\(\(state\) => \(\{\s*favoriteExerciseIds: state\.favoriteExerciseIds\.includes\(exerciseId\)\s*\?\s*state\.favoriteExerciseIds\.filter\(\(id\) => id !== exerciseId\)\s*:\s*\[\.\.\.state\.favoriteExerciseIds, exerciseId\],\s*\}\)\),/g,
  `toggleFavorite: (exerciseId) => {\n        const state = get();\n        const newFavs = state.favoriteExerciseIds.includes(exerciseId)\n          ? state.favoriteExerciseIds.filter((id) => id !== exerciseId)\n          : [...state.favoriteExerciseIds, exerciseId];\n        set({ favoriteExerciseIds: newFavs });\n        syncStateToCloud({ exercise_state: { favoriteExerciseIds: newFavs, recentlyViewedIds: state.recentlyViewedIds, customExercises: state.customExercises } });\n      },`
);

c = c.replace(
  /addToRecentlyViewed: \(exerciseId\) =>\s*set\(\(state\) => \{\s*const filtered = state\.recentlyViewedIds\.filter\(\(id\) => id !== exerciseId\);\s*return \{\s*recentlyViewedIds: \[exerciseId, \.\.\.filtered\]\.slice\(0, 10\),\s*\}\s*\}\),/g,
  `addToRecentlyViewed: (exerciseId) => {\n        const state = get();\n        const filtered = state.recentlyViewedIds.filter((id) => id !== exerciseId);\n        const newRecents = [exerciseId, ...filtered].slice(0, 10);\n        set({ recentlyViewedIds: newRecents });\n        syncStateToCloud({ exercise_state: { favoriteExerciseIds: state.favoriteExerciseIds, recentlyViewedIds: newRecents, customExercises: state.customExercises } });\n      },`
);

c = c.replace(
  /addCustomExercise: \(exercise\) =>\s*set\(\(state\) => \(\{\s*customExercises: \[\s*\.\.\.state\.customExercises,\s*\{\s*\.\.\.exercise,\s*id: `custom-\$\{Date\.now\(\)\}-\$\{Math\.random\(\)\.toString\(36\)\.substr\(2, 9\)\}`,\s*\},\s*\],\s*\}\)\),/g,
  `addCustomExercise: (exercise) => {\n        const state = get();\n        const newCustom = [\n          ...state.customExercises,\n          { ...exercise, id: \`custom-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\` }\n        ];\n        set({ customExercises: newCustom });\n        syncStateToCloud({ exercise_state: { favoriteExerciseIds: state.favoriteExerciseIds, recentlyViewedIds: state.recentlyViewedIds, customExercises: newCustom } });\n      },`
);

c = c.replace(
  /updateCustomExercise: \(id, updatedExercise\) =>\s*set\(\(state\) => \(\{\s*customExercises: state\.customExercises\.map\(\(ex\) =>\s*ex\.id === id \? \{ \.\.\.ex, \.\.\.updatedExercise \} : ex\s*\),\s*\}\)\),/g,
  `updateCustomExercise: (id, updatedExercise) => {\n        const state = get();\n        const newCustom = state.customExercises.map((ex) => ex.id === id ? { ...ex, ...updatedExercise } : ex);\n        set({ customExercises: newCustom });\n        syncStateToCloud({ exercise_state: { favoriteExerciseIds: state.favoriteExerciseIds, recentlyViewedIds: state.recentlyViewedIds, customExercises: newCustom } });\n      },`
);

c = c.replace(
  /deleteCustomExercise: \(id\) =>\s*set\(\(state\) => \(\{\s*customExercises: state\.customExercises\.filter\(\(ex\) => ex\.id !== id\),\s*\}\)\),/g,
  `deleteCustomExercise: (id) => {\n        const state = get();\n        const newCustom = state.customExercises.filter((ex) => ex.id !== id);\n        set({ customExercises: newCustom });\n        syncStateToCloud({ exercise_state: { favoriteExerciseIds: state.favoriteExerciseIds, recentlyViewedIds: state.recentlyViewedIds, customExercises: newCustom } });\n      },`
);

fs.writeFileSync('d:/Nexus/src/store/useExerciseStore.ts', c, 'utf8');
console.log('Exercise store updated.');
