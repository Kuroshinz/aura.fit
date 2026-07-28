const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres' });
async function check() {
  await client.connect();
  // Check auth.users for existing users
  const users = await client.query("SELECT id, email, raw_user_meta_data FROM auth.users;");
  console.log('=== EXISTING USERS ===');
  console.log(JSON.stringify(users.rows, null, 2));
  
  // Check if any profile has role
  const profiles = await client.query("SELECT id, full_name FROM public.profiles;");
  console.log('=== PROFILES ===');
  console.log(JSON.stringify(profiles.rows, null, 2));
  
  // Add role column if not exists
  await client.query("ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';");
  console.log('Added role column to profiles');
  
  process.exit(0);
}
check();
