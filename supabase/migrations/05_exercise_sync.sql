-- Add exercise state sync column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS exercise_state JSONB DEFAULT '{}'::jsonb;
