const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres" });

const EMAIL = 'nhanfreefire123456789@gmail.com';

async function checkAndFix() {
  await client.connect();
  try {
    // 1. Check user exists
    const userRes = await client.query(
      'SELECT id, email, encrypted_password, email_confirmed_at FROM auth.users WHERE email = $1 AND deleted_at IS NULL',
      [EMAIL]
    );
    if (userRes.rows.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }
    const user = userRes.rows[0];
    console.log('✅ User found:', user.id);
    console.log('   Email confirmed:', !!user.email_confirmed_at);

    // 2. Check identity records
    const ident = await client.query(
      "SELECT provider, provider_id FROM auth.identities WHERE user_id = $1",
      [user.id]
    );
    console.log('   Identities:', ident.rows.length);
    if (ident.rows.length > 0) console.log('   Providers:', ident.rows.map(r => r.provider).join(', '));

    // 3. Check role in profiles
    const profile = await client.query(
      'SELECT role, status, is_banned FROM profiles WHERE id = $1',
      [user.id]
    );
    if (profile.rows.length > 0) {
      console.log('   Profile role:', profile.rows[0].role, '| status:', profile.rows[0].status, '| banned:', profile.rows[0].is_banned);
    } else {
      console.log('   ⚠️ No profile — creating one...');
      await client.query(
        `INSERT INTO profiles (id, email, full_name, role, status)
         VALUES ($1, $2, 'Administrator', 'admin', 'active')
         ON CONFLICT (id) DO UPDATE SET role = 'admin'`,
        [user.id, EMAIL]
      );
      console.log('   ✅ Profile created with role=admin');
    }

    // 4. Clear any bad flags (ensure confirmations)
    await client.query(`
      UPDATE auth.users SET
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        confirmation_token = '',
        banned_until = NULL,
        deleted_at = NULL
      WHERE id = $1
    `, [user.id]);
    console.log('✅ User flags cleaned');

    // 5. CLEAR rate-limiting attempts so logins are not blocked
    const del = await client.query(`
      DELETE FROM auth_attempts
      WHERE action IN ('login', 'register')
    `);
    console.log(`✅ Cleared ${del.rowCount} rate-limit attempts`);

    // 6. Clear banned_users for this email (just in case)
    await client.query('DELETE FROM banned_users WHERE email = $1', [EMAIL]);
    console.log('✅ Cleared any ban for', EMAIL);

    console.log('');
    console.log('🎉 This account is READY for login:');
    console.log('   Email:    ' + EMAIL);
    console.log('   (Use the password you registered with this email)');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}
checkAndFix();
