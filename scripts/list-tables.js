const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const c = new Client({
  connectionString: 'postgresql://postgres.ojaqmtpjorszxwpkacus:nguyenthiennhan3062010@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
  family: 4,
});

async function main() {
  await c.connect();
  const r = await c.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  console.log('Tables:', r.rows.map(r => r.table_name).join(', '));
  await c.end();
  process.exit(0);
}
main().catch((e) => { console.error(e.message); process.exit(1); });
