-- Add JSONB schedule support for dynamic Excel imports
ALTER TABLE public.routines 
  ADD COLUMN IF NOT EXISTS schedule_data JSONB,
  ADD COLUMN IF NOT EXISTS split_id TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- Add updated_at for tracking routine activations
ALTER TABLE public.routines
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
