const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres" });

// Test the login by verifying credentials against the auth schema
async function testLogin() {
  await client.connect();
  try {
    const EMAIL = 'admin@nexus.fit';
    const PASSWORD = 'NexusAdmin@2026';

    // Simulate what Supabase auth does: find user, compare bcrypt password
    const res = await client.query(
      `SELECT u.id, u.email, u.encrypted_password
       FROM auth.users u
       WHERE u.email = $1 AND u.deleted_at IS NULL
       LIMIT 1`,
      [EMAIL]
    );

    if (res.rows.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }

    const user = res.rows[0];
    // Check bcrypt password match
    const match = await client.query(
      `SELECT (encrypted_password = crypt($2, encrypted_password)) AS matched
       FROM auth.users WHERE id = $1`,
      [user.id, PASSWORD]
    );

    console.log('User:', user.email);
    console.log('Password match:', match.rows[0].matched);

    if (match.rows[0].matched) {
      console.log('✅ Login credentials are VALID — you can log in now!');
    } else {
      console.log('❌ Password does NOT match');
    }

    // Check identities
    const ident = await client.query(
      `SELECT provider, provider_id FROM auth.identities WHERE user_id = $1`,
      [user.id]
    );
    console.log('Identities:', ident.rows);

    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}
testLogin();
