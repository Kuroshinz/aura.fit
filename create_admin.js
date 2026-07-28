const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ojaqmtpjorszxwpkacus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYXFtdHBqb3Jzenh3cGthY3VzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzk3NDM2OSwiZXhwIjoyMDU5NTUwMzY5fQ.4f5c5Vx1a5dYHPn1ha1HoND9M-DkQ3z0zWIsyrVR-94';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  // Create admin user
  const { data: userData, error: signUpError } = await supabase.auth.admin.createUser({
    email: 'admin@aura.fit',
    password: 'Admin@2026',
    email_confirm: true,
    user_metadata: {
      full_name: 'Super Admin AURA',
      role: 'admin'
    }
  });

  if (signUpError) {
    console.error('Signup error:', signUpError);
    return;
  }

  console.log('Admin user created:', userData.user.id);

  // Set role as admin in profiles
  const { error: updateError } = await supabase
    .from('profiles')
    .upsert({
      id: userData.user.id,
      full_name: 'Super Admin AURA',
      role: 'admin',
      age: 22,
      gender: 'male',
      height_cm: 175,
      weight_kg: 72.5,
      body_fat: 16.5,
      sessions_per_week: 5,
      goal: 'recomposition',
      experience: '3y+',
    }, { onConflict: 'id' });

  if (updateError) {
    console.error('Profile update error:', updateError);
  } else {
    console.log('Admin profile updated with role=admin!');
  }

  process.exit(0);
}

createAdmin();
