const fs = require('fs');
let c = fs.readFileSync('d:/Nexus/src/store/use-workout-store.ts', 'utf8');

c = c.replace('resetRestTimer: () => void\n  tickRestTimer: () => void', 'resetRestTimer: () => void\n  closeRestTimer: () => void\n  tickRestTimer: () => void');

c = c.replace(
  'resetRestTimer: () => {\n        set({ restTimerSeconds: 60, isRestTimerRunning: false })\n      },',
  'resetRestTimer: () => {\n        set({ restTimerSeconds: 60, isRestTimerRunning: false })\n      },\n\n      closeRestTimer: () => {\n        set({ restTimerSeconds: 0, isRestTimerRunning: false })\n      },'
);

c = c.replace(
  /if \(wasCompleted\) \{\s*set\(\{ isRestTimerRunning: true \}\)\s*\}/,
  `if (wasCompleted) {\n          const { restTimerSeconds } = get()\n          const newTime = restTimerSeconds <= 0 ? 60 : restTimerSeconds;\n          set({ restTimerSeconds: newTime, isRestTimerRunning: true })\n        }`
);

fs.writeFileSync('d:/Nexus/src/store/use-workout-store.ts', c, 'utf8');
console.log('Workout store updated with closeRestTimer');
