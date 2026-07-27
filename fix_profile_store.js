const fs = require('fs');
let c = fs.readFileSync('d:/Nexus/src/store/use-profile-store.ts', 'utf8');

c = c.replace(
  "import { getCurrentSessionEmail, saveAccountData } from '@/lib/utils/account-db'",
  "import { syncStateToCloud } from '@/lib/supabase/user-sync'"
);

c = c.replace(
  /setProfile: \(profile\) => \{\s*set\(\{ profile, isOnboardingComplete: true \}\)\s*\/\/ Sync to account DB to survive logout\/refresh\s*if \(typeof window !== 'undefined'\) \{\s*const currentEmail = getCurrentSessionEmail\(\)\s*if \(currentEmail\) \{\s*saveAccountData\(currentEmail, \{ profile \}\)\s*\}\s*\}\s*\}/g,
  "setProfile: (profile) => {\n        set({ profile, isOnboardingComplete: true })\n        syncStateToCloud({ age: profile.age, gender: profile.gender, height_cm: profile.height_cm, weight_kg: profile.weight_kg, body_fat: profile.body_fat, experience: profile.experience, goal: profile.goal, sessions_per_week: profile.sessions_per_week })\n      }"
);

c = c.replace(
  /updateProfile: \(partial\) => \{\s*const \{ profile \} = get\(\)\s*if \(!profile\) return\s*const updated = \{ \.\.\.profile, \.\.\.partial \}\s*set\(\{ profile: updated \}\)\s*\/\/ Sync to account DB via shadow copy\s*if \(typeof window !== 'undefined'\) \{\s*const currentEmail = getCurrentSessionEmail\(\)\s*if \(currentEmail\) \{\s*saveAccountData\(currentEmail, \{ profile: updated \}\)\s*\}\s*\}\s*\}/g,
  "updateProfile: (partial) => {\n        const { profile } = get()\n        if (!profile) return\n        const updated = { ...profile, ...partial }\n        set({ profile: updated })\n        syncStateToCloud({ age: updated.age, gender: updated.gender, height_cm: updated.height_cm, weight_kg: updated.weight_kg, body_fat: updated.body_fat, experience: updated.experience, goal: updated.goal, sessions_per_week: updated.sessions_per_week })\n      }"
);

fs.writeFileSync('d:/Nexus/src/store/use-profile-store.ts', c, 'utf8');
console.log('Profile store updated.');
