const fs = require('fs');
let c = fs.readFileSync('d:/Nexus/src/app/(dashboard)/routines/page.tsx', 'utf8');

// The duplicate block is around line 410
// Let's replace the duplicate nested block
c = c.replace(
  `{!isEditing && (
                    {!isEditing && (
                    <div className="flex items-center gap-3">`,
  `{!isEditing && (
                    <div className="flex items-center gap-3">`
);

// We need to fix the duplicate closing brackets too
c = c.replace(
  `                  )}
                  )}
                </div>`,
  `                  )}
                </div>`
);

fs.writeFileSync('d:/Nexus/src/app/(dashboard)/routines/page.tsx', c, 'utf8');
console.log('Fixed syntax error in routines page.');
