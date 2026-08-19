// Fix line 200 trong routines/page.tsx — tách dòng bị dính
const fs = require('fs');
const p = 'd:/Nexus/src/app/(dashboard)/routines/page.tsx';
let s = fs.readFileSync(p, 'utf8');

// Tìm và tách dòng bị dính:  return    const newRoutine
const broken = s.match(/if \(!confirm\([^)]*\)\) return[ \t]+const newRoutine/);
if (broken) {
  const fixed = broken[0].replace(/return[ \t]+const newRoutine/, 'return\n    const newRoutine');
  s = s.replace(broken[0], fixed);
  fs.writeFileSync(p, s, 'utf8');
  console.log('✅ Fixed concat line');
} else {
  console.log('⚠️ Không tìm thấy dòng lỗi (có thể đã ổn)');
}

// Verify
s = fs.readFileSync(p, 'utf8');
const lines = s.split('\n');
const found = lines.findIndex(l => l.includes('const newRoutine'));
console.log('Dòng newRoutine:', found + 1, '->', lines[found].trim());
