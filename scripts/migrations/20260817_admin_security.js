const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres" });

async function migrate() {
  await client.connect();
  try {
    // 1. Create admin audit log table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        email TEXT NOT NULL,
        action TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        status TEXT DEFAULT 'success',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_email ON admin_audit_logs(email);
      CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);
    `);

    // 2. Create the admin@nexus.fit profile row (auth user must be created separately)
    await client.query(`
      INSERT INTO profiles (id, email, full_name, role, status)
      SELECT
        (SELECT id FROM auth.users WHERE email = 'admin@nexus.fit'),
        'admin@nexus.fit',
        'Nexus Administrator',
        'admin',
        'active'
      WHERE EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@nexus.fit')
      ON CONFLICT (id) DO UPDATE SET role = 'admin', status = 'active', full_name = 'Nexus Administrator';
    `);

    // 3. Assign owner role if roles table has one
    await client.query(`
      UPDATE profiles p
      SET role_id = (SELECT id FROM roles WHERE name = 'owner' LIMIT 1)
      WHERE p.email = 'admin@nexus.fit' AND EXISTS (SELECT 1 FROM roles WHERE name = 'owner');
    `);

    console.log('✅ Migration successful! Admin audit logs table created.');
    console.log('📌 NOTE: The auth user admin@nexus.fit must exist. If not, create it via Supabase Dashboard → Authentication → Users → Add user, then re-run this script.');
    process.exit(0);
  } catch (e) {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  }
}
migrate();
