const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres'
});

async function run() {
  await client.connect();

  // Find user by email
  const users = await client.query(
    "SELECT id, email FROM auth.users WHERE email = 'nhanfreefire123456789@gmail.com';"
  );
  console.log('Found user:', JSON.stringify(users.rows));

  if (users.rows.length > 0) {
    const id = users.rows[0].id;
    await client.query(
      "UPDATE public.profiles SET role = 'admin', full_name = 'Iris' WHERE id = $1;",
      [id]
    );
    console.log('Role updated to admin for user ID:', id);
  } else {
    console.log('User not found!');
  }

  // Verify all profiles
  const profiles = await client.query("SELECT id, full_name, role FROM public.profiles;");
  console.log('\nAll profiles:', JSON.stringify(profiles.rows, null, 2));

  await client.end();
  process.exit(0);
}

run();
