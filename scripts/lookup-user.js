// Tra cứu user theo email trong Supabase (fix schema)
const { Client } = require('pg');
const c = new Client({
  connectionString: 'postgresql://postgres.ojaqmtpjorszxwpkacus:nguyenthiennhan3062010@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});
(async () => {
  await c.connect();
  // Xem columns có
  const cols = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='profiles' ORDER BY ordinal_position");
  console.log('=== COLUMNS profiles ===');
  console.log(cols.rows.map(r => r.column_name).join(', '));

  const email = 'guineofc@gmail.com';
  const r = await c.query("SELECT * FROM profiles WHERE email = $1 OR full_name ILIKE '%Vasques%'", [email]);
  if (r.rows.length === 0) {
    console.log('❌ Không tìm thấy profile với email:', email);
  } else {
    console.log('=== PROFILE TÌM THẤY ===');
    r.rows.forEach(row => console.log(JSON.stringify(row, null, 2)));
  }
  await c.end();
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
