const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres' });
async function fix() {
  await client.connect();
  await client.query("CREATE POLICY \"Enable read access for all users\" ON public.exercises_catalog FOR SELECT USING (true);");
  console.log('Fixed RLS!');
  process.exit(0);
}
fix();
