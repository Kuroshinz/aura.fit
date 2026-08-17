const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres" });

async function migrate() {
  await client.connect();
  try {
    // ─── 1. auth_attempts: IP-based rate limiting (3 attempts per IP) ───
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_attempts (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        ip_address TEXT NOT NULL,
        action TEXT NOT NULL,               -- 'login' | 'register'
        email TEXT,
        attempts INTEGER DEFAULT 1,
        window_start TIMESTAMPTZ DEFAULT NOW(),
        blocked_until TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(ip_address, action)
      );
      CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip ON auth_attempts(ip_address);
      CREATE INDEX IF NOT EXISTS idx_auth_attempts_blocked ON auth_attempts(blocked_until);
    `);

    // ─── 2. banned_users: ban by email or IP ───
    await client.query(`
      CREATE TABLE IF NOT EXISTS banned_users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        email TEXT UNIQUE,
        ip_address TEXT UNIQUE,
        reason TEXT,
        banned_by TEXT,
        banned_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── 3. Add ban flags to profiles ───
    await client.query(`
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;
    `);

    // ─── 4. RLS policies ───
    await client.query(`
      ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;

      -- auth_attempts: authenticated users can insert/update (rate limiting),
      -- admins can read
      DROP POLICY IF EXISTS "auth_attempts_insert" ON auth_attempts;
      CREATE POLICY "auth_attempts_insert" ON auth_attempts
        FOR INSERT TO authenticated WITH CHECK (true);

      DROP POLICY IF EXISTS "auth_attempts_update" ON auth_attempts;
      CREATE POLICY "auth_attempts_update" ON auth_attempts
        FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "auth_attempts_read_admin" ON auth_attempts;
      CREATE POLICY "auth_attempts_read_admin" ON auth_attempts
        FOR SELECT USING (
          EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','owner'))
        );

      -- banned_users: admins read/write, any authenticated can check existence
      DROP POLICY IF EXISTS "banned_users_insert_admin" ON banned_users;
      CREATE POLICY "banned_users_insert_admin" ON banned_users
        FOR INSERT TO authenticated WITH CHECK (
          EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','owner'))
        );

      DROP POLICY IF EXISTS "banned_users_read" ON banned_users;
      CREATE POLICY "banned_users_read" ON banned_users
        FOR SELECT TO authenticated USING (true);

      DROP POLICY IF EXISTS "banned_users_delete_admin" ON banned_users;
      CREATE POLICY "banned_users_delete_admin" ON banned_users
        FOR DELETE USING (
          EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','owner'))
        );
    `);

    // ─── 5. RPC: kick_user (delete all sessions) + ban_user ───
    await client.query(`
      CREATE OR REPLACE FUNCTION kick_user(target_user_id UUID)
      RETURNS BOOLEAN
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      BEGIN
        DELETE FROM auth.sessions WHERE user_id = target_user_id;
        RETURN TRUE;
      END;
      $$;
      GRANT EXECUTE ON FUNCTION kick_user(UUID) TO authenticated;

      CREATE OR REPLACE FUNCTION ban_user(target_user_id UUID, ban_reason TEXT DEFAULT 'Violation of terms')
      RETURNS BOOLEAN
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      DECLARE
        target_email TEXT;
      BEGIN
        SELECT email INTO target_email FROM profiles WHERE id = target_user_id;
        UPDATE profiles SET is_banned = true, ban_reason = ban_reason, status = 'banned' WHERE id = target_user_id;
        IF target_email IS NOT NULL THEN
          INSERT INTO banned_users (email, reason, banned_by)
          VALUES (target_email, ban_reason, auth.jwt()->>'email')
          ON CONFLICT (email) DO UPDATE SET reason = EXCLUDED.reason, banned_at = NOW();
        END IF;
        -- Also kick them out of all sessions
        DELETE FROM auth.sessions WHERE user_id = target_user_id;
        RETURN TRUE;
      END;
      $$;
      GRANT EXECUTE ON FUNCTION ban_user(UUID, TEXT) TO authenticated;

      CREATE OR REPLACE FUNCTION unban_user(target_user_id UUID)
      RETURNS BOOLEAN
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      DECLARE
        target_email TEXT;
      BEGIN
        SELECT email INTO target_email FROM profiles WHERE id = target_user_id;
        UPDATE profiles SET is_banned = false, ban_reason = NULL, status = 'active' WHERE id = target_user_id;
        IF target_email IS NOT NULL THEN
          DELETE FROM banned_users WHERE email = target_email;
        END IF;
        RETURN TRUE;
      END;
      $$;
      GRANT EXECUTE ON FUNCTION unban_user(UUID) TO authenticated;
    `);

    console.log('✅ Security layer migration successful!');
    console.log('   Tables: auth_attempts, banned_users');
    console.log('   Columns: profiles.is_banned, profiles.ban_reason');
    console.log('   RPCs: kick_user, ban_user, unban_user');
    process.exit(0);
  } catch (e) {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  }
}
migrate();
