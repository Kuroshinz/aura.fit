const fs = require('fs');
let file = 'd:/Nexus/src/app/(dashboard)/routines/page.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  "import { useProfileStore } from '@/store/use-profile-store'",
  "import { useProfileStore } from '@/store/use-profile-store'\nimport { getCurrentSessionEmail, saveAccountData } from '@/lib/utils/account-db'"
);

c = c.replace(
  "localStorage.setItem('aura_custom_routine', JSON.stringify(parsed))",
  "localStorage.setItem('aura_custom_routine', JSON.stringify(parsed))\n          const email = getCurrentSessionEmail()\n          if (email) saveAccountData(email, { customRoutine: parsed })"
);

c = c.replace(
  "localStorage.setItem('aura_custom_routine', JSON.stringify(customRoutineObj))",
  "localStorage.setItem('aura_custom_routine', JSON.stringify(customRoutineObj))\n                  const email = getCurrentSessionEmail()\n                  if (email) saveAccountData(email, { customRoutine: customRoutineObj })"
);

fs.writeFileSync(file, c, 'utf8');
console.log('Done!');
