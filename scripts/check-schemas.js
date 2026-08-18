const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const c = new Client({
  connectionString: 'postgresql://postgres.ojaqmtpjorszxwpkacus:nguyenthiennhan3062010@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
  family: 4,
});

async function main() {
  await c.connect();
  for (const t of ['admin_audit_logs', 'subscriptions', 'auth_attempts', 'banned_users']) {
    const r = await c.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`,
      [t]
    );
    console.log(`\n📋 ${t}:`, r.rows.map(c => `${c.column_name}:${c.data_type}`).join(', '));
  }
  await c.end();
  process.exit(0);
}
main().catch((e) => { console.error(e.message); process.exit(1); });
