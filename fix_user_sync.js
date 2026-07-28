const fs = require('fs');
let c = fs.readFileSync('d:/Nexus/src/lib/supabase/user-sync.ts', 'utf8');

const replaceTarget = `const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)`;

const newCode = `const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      )

      if (Object.keys(cleanUpdates).length === 0) return

      const { error } = await supabase
        .from('profiles')
        .update(cleanUpdates)
        .eq('id', user.id)`;

c = c.replace(replaceTarget, newCode);
c = c.replace(/console\.error\('Failed to sync state to cloud:', error\)/g, "console.error('Failed to sync state to cloud:', error.message || JSON.stringify(error))");

fs.writeFileSync('d:/Nexus/src/lib/supabase/user-sync.ts', c, 'utf8');
console.log('Fixed undefined updates and error logging');
