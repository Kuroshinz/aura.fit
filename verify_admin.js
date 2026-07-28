const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres' });

async function check() {
  await client.connect();
  
  // Check admin auth user
  const users = await client.query("SELECT id, email, created_at FROM auth.users WHERE email = 'admin@aura.fit';");
  console.log('Admin auth user:', JSON.stringify(users.rows, null, 2));
  
  if (users.rows.length === 0) {
    console.log('Admin user not found in auth.users!');
    process.exit(1);
  }
  
  const adminId = users.rows[0].id;
  
  // Check admin profile
  const profiles = await client.query("SELECT id, full_name, role FROM public.profiles WHERE id = $1;", [adminId]);
  console.log('Admin profile:', JSON.stringify(profiles.rows, null, 2));
  
  // If profile exists but role not set, update it
  if (profiles.rows.length > 0) {
    if (profiles.rows[0].role !== 'admin') {
      await client.query("UPDATE public.profiles SET role = 'admin', full_name = 'Super Admin AURA' WHERE id = $1;", [adminId]);
      console.log('Updated admin role!');
    } else {
      console.log('Admin role already set correctly!');
    }
  } else {
    // Create profile
    await client.query(
      "INSERT INTO public.profiles (id, full_name, role) VALUES ($1, 'Super Admin AURA', 'admin');",
      [adminId]
    );
    console.log('Created admin profile!');
  }
  
  // List all profiles for verification
  const allProfiles = await client.query("SELECT id, full_name, role FROM public.profiles;");
  console.log('\nAll profiles:', JSON.stringify(allProfiles.rows, null, 2));
  
  await client.end();
  process.exit(0);
}

check();
