const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ojaqmtpjorszxwpkacus.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYXFtdHBqb3Jzenh3cGthY3VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4OTczNjQsImV4cCI6MjEwMDQ3MzM2NH0.DZqyxbrfbC_gPM2zPyg87EhOx3nBDyxdfyYnxY60kX8';
const dbConnStr = 'postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres';

async function createAdmin() {
  const client = new Client({ connectionString: dbConnStr });
  await client.connect();
  
  // Check if admin already exists
  const existing = await client.query("SELECT id FROM auth.users WHERE email = 'admin@aura.fit';");
  
  if (existing.rows.length > 0) {
    console.log('Admin user already exists, updating role...');
    await client.query("UPDATE public.profiles SET role = 'admin', full_name = 'Super Admin AURA' WHERE id = $1;", [existing.rows[0].id]);
    console.log('Admin role set!');
    process.exit(0);
  }
  
  // Admin doesn't exist - create via signup
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@aura.fit',
    password: 'Admin@2026',
    options: {
      data: { full_name: 'Super Admin AURA' }
    }
  });
  
  if (error) {
    console.error('Signup error:', error.message);
    
    // If already registered, just set role
    if (error.message.includes('already registered') || error.message.includes('User already registered')) {
      const user = await client.query("SELECT id FROM auth.users WHERE email = 'admin@aura.fit';");
      if (user.rows.length > 0) {
        await client.query("UPDATE public.profiles SET role = 'admin', full_name = 'Super Admin AURA' WHERE id = $1;", [user.rows[0].id]);
        console.log('Found existing user, role set to admin!');
      }
    }
    process.exit(0);
  }
  
  if (data.user) {
    console.log('Admin signed up! ID:', data.user.id);
    
    // Wait a moment for trigger to create profile
    await new Promise(r => setTimeout(r, 2000));
    
    // Set role
    const { error: upErr } = await supabase
      .from('profiles')
      .update({ role: 'admin', full_name: 'Super Admin AURA' })
      .eq('id', data.user.id);
    
    if (upErr) {
      // Direct SQL fallback
      await client.query("UPDATE public.profiles SET role = 'admin', full_name = 'Super Admin AURA' WHERE id = $1;", [data.user.id]);
    }
    
    console.log('Admin profile created with full access!');
  }
  
  await client.end();
  process.exit(0);
}

createAdmin();
