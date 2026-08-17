const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres" });

async function migrate() {
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_otp (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        attempts INTEGER DEFAULT 0,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_admin_otp_email ON admin_otp(email);
      CREATE INDEX IF NOT EXISTS idx_admin_otp_expires ON admin_otp(expires_at);

      ALTER TABLE admin_otp ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "admin_otp_insert" ON admin_otp;
      CREATE POLICY "admin_otp_insert" ON admin_otp
        FOR INSERT TO authenticated WITH CHECK (true);

      DROP POLICY IF EXISTS "admin_otp_select" ON admin_otp;
      CREATE POLICY "admin_otp_select" ON admin_otp
        FOR SELECT TO authenticated USING (true);

      DROP POLICY IF EXISTS "admin_otp_update" ON admin_otp;
      CREATE POLICY "admin_otp_update" ON admin_otp
        FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    `);
    console.log('✅ admin_otp table created with RLS policies.');
    process.exit(0);
  } catch (e) {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  }
}
migrate();
