const { Client } = require('pg');
const dns = require('dns');
const fs = require('fs');
const path = require('path');
dns.setDefaultResultOrder('ipv4first');

const c = new Client({
  connectionString: 'postgresql://postgres.ojaqmtpjorszxwpkacus:nguyenthiennhan3062010@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
  family: 4,
});

async function main() {
  await c.connect();
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '13_admin_panel_rls_extra.sql'), 'utf8');
  await c.query(sql);
  console.log('✅ Extra migration executed successfully');
  await c.end();
  process.exit(0);
}
main().catch((e) => { console.error('❌ Migration failed:', e.message); process.exit(1); });
