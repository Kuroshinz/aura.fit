-- Add JSONB columns to the profiles table to synchronize Zustand store data
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS workout_history JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS personal_records JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS active_workout JSONB;
