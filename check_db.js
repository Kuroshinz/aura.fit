const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres"
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'exercises';");
  console.log(res.rows.map(r => r.column_name));
  process.exit(0);
}
check();
