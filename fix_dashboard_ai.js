const fs = require('fs');
let c = fs.readFileSync('d:/Nexus/src/app/(dashboard)/dashboard/page.tsx', 'utf8');
c = c.replace("import { BodyMetricsTracker } from '@/components/dashboard/body-metrics-tracker'", "import { BodyMetricsTracker } from '@/components/dashboard/body-metrics-tracker'\nimport { AICoach } from '@/components/dashboard/ai-coach'");
c = c.replace(/<VolumeChart \/>/g, '<AICoach />\n              <VolumeChart />');
fs.writeFileSync('d:/Nexus/src/app/(dashboard)/dashboard/page.tsx', c, 'utf8');
console.log('Added AICoach to dashboard');
