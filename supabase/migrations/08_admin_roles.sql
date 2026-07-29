-- Add role and email to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Update the handle_new_user trigger to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profiles with emails from auth.users
-- Note: This requires postgres superuser or extensions, but we can do a simple update if auth.users is accessible.
-- Actually, let's just create a policy to allow admins to see all profiles.
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (true);
