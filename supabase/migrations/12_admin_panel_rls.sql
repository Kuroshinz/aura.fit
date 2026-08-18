-- RLS policies cho AURA.FIT admin panel (embedded)
-- Cho phép admin (role=admin/owner trong profiles) full CRUD trên bảng quản trị

-- ============================================================
-- 1. PROFILES — admin có thể UPDATE (suspend, đổi role)
-- ============================================================
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'owner')
    )
  );

DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'owner')
    )
  );

-- ============================================================
-- 2. ROLES + ROLE_PERMISSIONS — admin full CRUD (RLS đang OFF, thêm policy để an toàn)
-- ============================================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Roles admin full access" ON roles;
CREATE POLICY "Roles admin full access" ON roles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
    )
  );

DROP POLICY IF EXISTS "Role permissions admin full access" ON role_permissions;
CREATE POLICY "Role permissions admin full access" ON role_permissions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
    )
  );

-- ============================================================
-- 3. EXERCISES — admin có thể INSERT/UPDATE/DELETE
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage exercises" ON exercises;
CREATE POLICY "Admins can manage exercises" ON exercises
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
    )
  );

-- ============================================================
-- 4. ADMIN_AUDIT_LOGS — admin full access
-- ============================================================
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Audit logs admin full access" ON admin_audit_logs;
CREATE POLICY "Audit logs admin full access" ON admin_audit_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
    )
  );

-- system_errors may not exist — apply only if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'system_errors') THEN
    ALTER TABLE system_errors ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "System errors admin full access" ON system_errors;
    CREATE POLICY "System errors admin full access" ON system_errors
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
        )
      );
  END IF;
END $$;

-- ============================================================
-- 5. AUTH_ATTEMPTS + BANNED_USERS — admin full access (cho Threat Monitor & Security)
-- ============================================================
ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth attempts admin full access" ON auth_attempts;
CREATE POLICY "Auth attempts admin full access" ON auth_attempts
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
    )
  );

DROP POLICY IF EXISTS "Banned users admin full access" ON banned_users;
CREATE POLICY "Banned users admin full access" ON banned_users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
    )
  );

-- Log
SELECT '✅ Admin RLS policies applied' AS result;
