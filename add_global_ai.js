const fs = require('fs');
let c = fs.readFileSync('d:/Nexus/src/app/(dashboard)/layout.tsx', 'utf8');

if (!c.includes('GlobalAICoach')) {
  c = c.replace(
    "import { CommandPalette } from '@/components/layout/command-palette'",
    "import { CommandPalette } from '@/components/layout/command-palette'\nimport { GlobalAICoach } from '@/components/layout/global-ai-coach'"
  );

  c = c.replace(
    "<CommandPalette />",
    "<CommandPalette />\n      <GlobalAICoach />"
  );
}

fs.writeFileSync('d:/Nexus/src/app/(dashboard)/layout.tsx', c, 'utf8');
console.log('Added GlobalAICoach to layout');
