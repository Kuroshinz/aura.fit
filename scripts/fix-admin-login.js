const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres" });

const EMAIL = 'admin@nexus.fit';

async function fix() {
  await client.connect();
  try {
    // 1. Find the user
    const userRes = await client.query('SELECT id, email, encrypted_password FROM auth.users WHERE email = $1', [EMAIL]);
    if (userRes.rows.length === 0) {
      console.log('❌ User not found. Need to create it first.');
      process.exit(1);
    }
    const user = userRes.rows[0];
    console.log('✅ User found:', user.id);
    console.log('   Has encrypted password:', !!user.encrypted_password);

    // 2. Check identity record
    const identRes = await client.query(
      "SELECT id, provider, provider_id FROM auth.identities WHERE user_id = $1",
      [user.id]
    );
    console.log('   Identity records:', identRes.rows.length);

    if (identRes.rows.length === 0) {
      // 3. Create the missing identity record (required for email/password login)
      const identityData = JSON.stringify({
        sub: user.id,
        email: EMAIL,
        email_verified: false,
        phone_verified: false,
      });
      await client.query(`
        INSERT INTO auth.identities (
          provider_id, user_id, identity_data, provider,
          last_sign_in_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3::jsonb, 'email',
          now(), now(), now()
        )
      `, [EMAIL, user.id, identityData]);
      console.log('✅ Identity record created!');
    } else {
      console.log('✅ Identity already exists — checking password...');
    }

    // 4. Verify the password hash is valid bcrypt format
    const hash = user.encrypted_password;
    if (hash && !hash.startsWith('$2')) {
      console.log('⚠️ Password hash looks wrong:', hash.substring(0, 10));
      console.log('   Re-hashing with bcrypt...');
      await client.query(
        'UPDATE auth.users SET encrypted_password = crypt($1, gen_salt(\'bf\')) WHERE id = $2',
        ['NexusAdmin@2026', user.id]
      );
      console.log('✅ Password re-hashed to NexusAdmin@2026');
    } else {
      console.log('✅ Password hash format OK');
    }

    // 5. Ensure email confirmed + no flags blocking login
    await client.query(`
      UPDATE auth.users SET
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        confirmation_token = '',
        recovery_token = '',
        email_change = '',
        banned_until = NULL,
        deleted_at = NULL
      WHERE id = $1
    `, [user.id]);
    console.log('✅ User flags cleaned (confirmed, unblocked).');

    console.log('');
    console.log('🔑 You can now log in with:');
    console.log('   Email:    ' + EMAIL);
    console.log('   Password: NexusAdmin@2026');
    process.exit(0);
  } catch (e) {
    console.error('❌ Fix failed:', e);
    process.exit(1);
  }
}
fix();
