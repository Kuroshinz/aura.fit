const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres" });

async function migrate() {
  await client.connect();
  try {
    await client.query(`
      ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

      -- Only admins can READ audit logs
      DROP POLICY IF EXISTS "admin_audit_read" ON admin_audit_logs;
      CREATE POLICY "admin_audit_read" ON admin_audit_logs
        FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
          )
        );

      -- Any authenticated user can WRITE (login attempt logging needs to work pre-role-check)
      DROP POLICY IF EXISTS "admin_audit_insert" ON admin_audit_logs;
      CREATE POLICY "admin_audit_insert" ON admin_audit_logs
        FOR INSERT
        TO authenticated
        WITH CHECK (true);

      -- Admin can delete old logs
      DROP POLICY IF EXISTS "admin_audit_delete" ON admin_audit_logs;
      CREATE POLICY "admin_audit_delete" ON admin_audit_logs
        FOR DELETE
        USING (
          EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
          )
        );
    `);
    console.log('✅ RLS policies created for admin_audit_logs');
    process.exit(0);
  } catch (e) {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  }
}
migrate();
