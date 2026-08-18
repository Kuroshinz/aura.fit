const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const c = new Client({
  connectionString: 'postgresql://postgres.ojaqmtpjorszxwpkacus:nguyenthiennhan3062010@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
  family: 4,
});

async function main() {
  await c.connect();
  // Check RLS enabled + policies on key tables
  const tables = ['profiles', 'roles', 'role_permissions', 'exercises', 'user_workouts', 'system_errors', 'audit_logs'];
  for (const t of tables) {
    const rls = await c.query(
      `SELECT relname, relrowsecurity FROM pg_class WHERE relname = $1`,
      [t]
    );
    const policies = await c.query(
      `SELECT policyname, permissive, roles::text, cmd FROM pg_policies WHERE tablename = $1`,
      [t]
    );
    console.log(`\n📋 ${t}: RLS=${rls.rows[0]?.relrowsecurity ? 'ON' : 'OFF'}`);
    if (policies.rows.length === 0) {
      console.log('   ⚠️ NO POLICIES');
    } else {
      for (const p of policies.rows) {
        console.log(`   - ${p.policyname} [${p.cmd}] roles=${p.roles}`);
      }
    }
  }
  await c.end();
  process.exit(0);
}
main().catch((e) => { console.error(e.message); process.exit(1); });
