const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres'
});

async function run() {
  await client.connect();

  // Find admin user
  const users = await client.query(
    "SELECT id, email FROM auth.users WHERE email = 'admin@aura.fit';"
  );
  console.log('Found user:', JSON.stringify(users.rows));

  if (users.rows.length > 0) {
    const id = users.rows[0].id;
    
    // Delete from profiles first
    await client.query("DELETE FROM public.profiles WHERE id = $1;", [id]);
    console.log('Deleted from public.profiles');
    
    // Delete from auth.users
    await client.query("DELETE FROM auth.users WHERE id = $1;", [id]);
    console.log('Deleted from auth.users');
    
    console.log('Account admin@aura.fit fully deleted!');
  } else {
    console.log('User not found!');
  }

  // Verify remaining users
  const remaining = await client.query("SELECT id, email FROM auth.users;");
  console.log('\nRemaining users:', JSON.stringify(remaining.rows, null, 2));

  await client.end();
  process.exit(0);
}

run();
