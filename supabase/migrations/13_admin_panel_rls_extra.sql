-- RLS bổ sung: subscriptions, workout_logs, routines, permissions, exercises_catalog
-- Cho admin (role admin/owner) full quyền trên các bảng admin panel cần CRUD

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['subscriptions', 'workout_logs', 'routines', 'routine_exercises', 'permissions', 'exercises_catalog'] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);

      EXECUTE format('DROP POLICY IF EXISTS "Admin full access %I" ON %I', tbl, tbl);
      EXECUTE format('
        CREATE POLICY "Admin full access %I" ON %I
          FOR ALL TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles p
              WHERE p.id = auth.uid() AND p.role IN (''admin'', ''owner'')
            )
          )
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM profiles p
              WHERE p.id = auth.uid() AND p.role IN (''admin'', ''owner'')
            )
          )
      ', tbl, tbl);
    END IF;
  END LOOP;
END $$;

SELECT '✅ Additional admin RLS policies applied' AS result;
