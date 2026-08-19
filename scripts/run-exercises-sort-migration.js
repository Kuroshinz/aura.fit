// Chạy migration 14: thêm sort_order vào bảng exercises
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const c = new Client({
  connectionString: 'postgresql://postgres.ojaqmtpjorszxwpkacus:nguyenthiennhan3062010@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await c.connect();
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '14_exercises_sort_order.sql'), 'utf8');
  await c.query(sql);
  console.log('✅ Migration 14 applied: exercises.sort_order added');

  // Verify
  const r = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='exercises' AND column_name='sort_order'");
  console.log('Verify:', JSON.stringify(r.rows));
  await c.end();
})().catch(e => { console.error('❌ ERR:', e.message); process.exit(1); });
