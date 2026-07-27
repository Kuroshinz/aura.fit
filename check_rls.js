const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres' });
async function check() {
  await client.connect();
  const res = await client.query("SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'exercises_catalog';");
  console.log(res.rows);
  
  const res2 = await client.query("SELECT policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE tablename = 'exercises_catalog';");
  console.log('Policies:', res2.rows);
  process.exit(0);
}
check();
