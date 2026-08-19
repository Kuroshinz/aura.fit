-- Migration 14: Thêm sort_order cho bảng exercises (kéo thả sắp xếp)
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Đánh số thứ tự hiện tại theo tên (mặc định) nếu tất cả đang bằng 0
UPDATE exercises e
SET sort_order = sub.new_order
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name ASC) - 1 AS new_order
  FROM exercises
) sub
WHERE e.id = sub.id
  AND e.sort_order = 0;

-- Admin đã có full CRUD qua migration 12/13, nhưng đảm bảo update sort_order OK
DROP POLICY IF EXISTS "admin_full_crud_exercises_sort" ON exercises;
CREATE POLICY "admin_full_crud_exercises_sort" ON exercises
  FOR UPDATE USING (auth.jwt() ->> 'role' IN ('admin', 'owner', 'service_role'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'owner', 'service_role'));
