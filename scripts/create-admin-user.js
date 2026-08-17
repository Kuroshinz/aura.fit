const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres" });

const EMAIL = 'admin@nexus.fit';
const TEMP_PASSWORD = process.argv[2] || 'NexusAdmin@2026';

async function create() {
  await client.connect();
  try {
    // Check if user exists
    const existing = await client.query('SELECT id FROM auth.users WHERE email = $1', [EMAIL]);
    if (existing.rows.length > 0) {
      console.log('User already exists:', existing.rows[0].id);
      process.exit(0);
    }

    // Create auth user with bcrypt-encrypted temp password
    const userId = '00000000-0000-4000-8000-' + require('crypto').randomBytes(6).toString('hex');
    const result = await client.query(`
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, invited_at, confirmation_token, recovery_token,
        email_change_token_new, email_change, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        $1, 'authenticated', 'authenticated', $2, crypt($3, gen_salt('bf')),
        now(), now(), '', '', '', '', now(), now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Nexus Administrator"}',
        false, false
      ) RETURNING id
    `, [userId, EMAIL, TEMP_PASSWORD]);

    console.log('✅ Auth user created:', result.rows[0].id);

    // Create matching profile
    await client.query(`
      INSERT INTO profiles (id, email, full_name, role, status, created_at)
      VALUES ($1, $2, 'Nexus Administrator', 'admin', 'active', now())
      ON CONFLICT (id) DO UPDATE SET role = 'admin', status = 'active'
    `, [userId, EMAIL]);

    console.log('✅ Profile created with role=admin');
    console.log('');
    console.log('🔑 TEMPORARY PASSWORD:', TEMP_PASSWORD);
    console.log('   → Change it after first login!');
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
  process.exit(0);
}
create();
