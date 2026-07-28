-- Add metrics history sync column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS metrics_history JSONB DEFAULT '[]'::jsonb;
