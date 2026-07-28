const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres' });
async function check() {
  await client.connect();
  const res = await client.query("SELECT policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE tablename = 'profiles';");
  console.log('Policies:', res.rows);
  process.exit(0);
}
check();
