const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres" });

async function check() {
  await client.connect();
  try {
    const res = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'routines' ORDER BY ordinal_position"
    );
    console.log('routines columns:', res.rows.map(r => r.column_name).join(', '));
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}
check();
