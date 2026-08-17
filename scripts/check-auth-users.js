const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres" });

async function check() {
  await client.connect();
  try {
    const res = await client.query("SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC");
    console.log(JSON.stringify(res.rows, null, 2));
    if (res.rows.length === 0) console.log('NO AUTH USERS FOUND');
  } catch (e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}
check();
