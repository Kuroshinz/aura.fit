const fs = require('fs');
let c = fs.readFileSync('d:/Nexus/src/app/(dashboard)/dashboard/page.tsx', 'utf8');

c = c.replace("import { AICoach } from '@/components/dashboard/ai-coach'", "");
c = c.replace("<AICoach />", "");

fs.writeFileSync('d:/Nexus/src/app/(dashboard)/dashboard/page.tsx', c, 'utf8');
console.log('Removed static AICoach from Dashboard');
