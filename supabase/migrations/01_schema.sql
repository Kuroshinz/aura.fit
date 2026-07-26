-- Migration Script: Gym Workout Tracker Schema & RLS Policies

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. EXERCISES TABLE
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL, -- 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'
  equipment TEXT,
  is_custom BOOLEAN DEFAULT false NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view default exercises or own custom exercises" 
  ON public.exercises FOR SELECT 
  USING (is_custom = false OR created_by = auth.uid());

CREATE POLICY "Users can insert their own custom exercises" 
  ON public.exercises FOR INSERT 
  WITH CHECK (auth.uid() = created_by AND is_custom = true);

-- 3. ROUTINES TABLE
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own routines" 
  ON public.routines FOR ALL USING (auth.uid() = user_id);

-- 4. ROUTINE EXERCISES TABLE
CREATE TABLE IF NOT EXISTS public.routine_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index INT NOT NULL DEFAULT 0,
  target_sets INT DEFAULT 3 NOT NULL
);

ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their routine exercises" 
  ON public.routine_exercises FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.routines 
      WHERE routines.id = routine_exercises.routine_id 
      AND routines.user_id = auth.uid()
    )
  );

-- 5. WORKOUT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES public.routines(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  total_volume NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workout logs" 
  ON public.workout_logs FOR ALL USING (auth.uid() = user_id);

-- 6. SET LOGS TABLE
CREATE TABLE IF NOT EXISTS public.set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id UUID NOT NULL REFERENCES public.workout_logs(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  set_number INT NOT NULL,
  weight_kg NUMERIC(6, 2) DEFAULT 0 NOT NULL,
  reps INT DEFAULT 0 NOT NULL,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.set_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own set logs" 
  ON public.set_logs FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_logs 
      WHERE workout_logs.id = set_logs.workout_log_id 
      AND workout_logs.user_id = auth.uid()
    )
  );

-- SEED DEFAULT SYSTEM EXERCISES
INSERT INTO public.exercises (name, muscle_group, equipment, is_custom) VALUES
  ('Bench Press', 'Chest', 'Barbell', false),
  ('Incline Dumbbell Press', 'Chest', 'Dumbbell', false),
  ('Push Ups', 'Chest', 'Bodyweight', false),
  ('Lat Pulldown', 'Back', 'Cable', false),
  ('Barbell Row', 'Back', 'Barbell', false),
  ('Pull Ups', 'Back', 'Bodyweight', false),
  ('Barbell Squat', 'Legs', 'Barbell', false),
  ('Leg Press', 'Legs', 'Machine', false),
  ('Romanian Deadlift', 'Legs', 'Barbell', false),
  ('Overhead Shoulder Press', 'Shoulders', 'Barbell', false),
  ('Lateral Raise', 'Shoulders', 'Dumbbell', false),
  ('Bicep Curl', 'Arms', 'Dumbbell', false),
  ('Tricep Pushdown', 'Arms', 'Cable', false),
  ('Plank', 'Core', 'Bodyweight', false),
  ('Hanging Leg Raise', 'Core', 'Bodyweight', false)
ON CONFLICT DO NOTHING;
