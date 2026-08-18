const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const c = new Client({
  connectionString: 'postgresql://postgres.ojaqmtpjorszxwpkacus:nguyenthiennhan3062010@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
  family: 4,
});

async function main() {
  await c.connect();
  const r = await c.query(
    "SELECT id, email, role, status, is_banned FROM profiles WHERE email = 'nhanfreefire123456789@gmail.com'"
  );
  console.log('Profile:', JSON.stringify(r.rows, null, 2));

  // Check profiles role column distinct values
  const roles = await c.query('SELECT DISTINCT role FROM profiles LIMIT 10');
  console.log('All roles:', roles.rows.map(r => r.role).join(', '));

  // Check if there's a roles table
  const tbl = await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%role%'");
  console.log('Role tables:', tbl.rows.map(r => r.table_name).join(', '));
  await c.end();
  process.exit(0);
}
main().catch((e) => { console.error(e.message); process.exit(1); });
