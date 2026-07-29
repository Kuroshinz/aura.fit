const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'src', 'data', 'exercises-dataset-imported.ts');
let content = fs.readFileSync(filePath, 'utf-8');
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Kuroshinz/aura.fit/main/public';
let replaced = content
  .split('"thumbnailUrl": "/exercises/images/')
  .join(`"thumbnailUrl": "${GITHUB_RAW_BASE}/exercises/images/`)
  .split('"videoUrl": "/exercises/videos/')
  .join(`"videoUrl": "${GITHUB_RAW_BASE}/exercises/videos/`);
fs.writeFileSync(filePath, replaced, 'utf-8');
const thumbCount = (content.match(/"thumbnailUrl":/g) || []).length;
const videoCount = (content.match(/"videoUrl":/g) || []).length;
console.log(`Thumbnails done: ${thumbCount}`);
console.log(`Videos done: ${videoCount}`);
console.log('All URLs updated to GitHub raw URLs.');
