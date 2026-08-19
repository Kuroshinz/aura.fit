// Kiểm tra schema bảng exercises
const { Client } = require('pg');
const c = new Client({
  connectionString: 'postgresql://postgres.ojaqmtpjorszxwpkacus:nguyenthiennhan3062010@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});
(async () => {
  await c.connect();
  const r = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='exercises' ORDER BY ordinal_position");
  console.log(r.rows.map(x => `${x.column_name} (${x.data_type})`).join('\n'));
  await c.end();
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
