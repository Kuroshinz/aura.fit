const fs = require('fs');

function replaceStore(filePath, regexes) {
  let c = fs.readFileSync(filePath, 'utf8');
  for (const item of regexes) {
    c = c.replace(item.r, item.val);
  }
  fs.writeFileSync(filePath, c, 'utf8');
}

// 1. Workout Store
replaceStore('d:/Nexus/src/store/use-workout-store.ts', [
  { r: /import \{ syncWorkoutStateToCloud \} from '@\/lib\/supabase\/workout-sync'/g, val: "import { syncStateToCloud } from '@/lib/supabase/user-sync'" },
  { r: /syncWorkoutStateToCloud/g, val: 'syncStateToCloud' }
]);

console.log('Workout store updated.');
