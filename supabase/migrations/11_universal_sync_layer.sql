-- supabase/migrations/11_universal_sync_layer.sql
-- 1. Add versioning to core tables (example: profiles)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- 2. Create Sync Queue Table
CREATE TABLE IF NOT EXISTS public.sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    operation_type TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    payload JSONB NOT NULL,
    version INTEGER NOT NULL,
    source_platform TEXT NOT NULL, -- 'web', 'telegram', 'mobile'
    status TEXT DEFAULT 'pending', -- 'pending', 'processed', 'conflict', 'error'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Audit Log Table
CREATE TABLE IF NOT EXISTS public.sync_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name TEXT NOT NULL,
    operation_type TEXT NOT NULL,
    previous_version JSONB,
    new_version JSONB,
    source_platform TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status TEXT NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can manage queue, users can insert
CREATE POLICY "Users can insert sync items" ON public.sync_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage sync queue" ON public.sync_queue FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
