const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  
  // Check routines table columns
  const cols = await client.query(
    "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'routines' ORDER BY ordinal_position;"
  );
  console.log('--- routines columns ---');
  console.log(JSON.stringify(cols.rows, null, 2));

  // Check sample data
  const data = await client.query("SELECT id, user_id, name, split_id FROM routines LIMIT 5;");
  console.log('\n--- routines data ---');
  console.log(JSON.stringify(data.rows, null, 2));
  
  await client.end();
  process.exit(0);
}
run();
