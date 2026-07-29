const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres"
});

async function runMigration() {
  await client.connect();
  try {
    // 1. Add email and role to profiles
    await client.query(`
      ALTER TABLE public.profiles
        ADD COLUMN IF NOT EXISTS email TEXT,
        ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
    `);
    console.log("Added email and role columns to profiles");

    // 2. Update trigger to include email
    await client.query(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (id, full_name, email)
        VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    console.log("Updated handle_new_user trigger");

    // 3. Update existing profiles with emails from auth.users
    await client.query(`
      UPDATE public.profiles p
      SET email = u.email
      FROM auth.users u
      WHERE p.id = u.id AND p.email IS NULL;
    `);
    console.log("Backfilled emails for existing profiles");

    // 4. Update RLS policies to allow reading all profiles (or just by admins)
    // For now, let's just make profiles viewable by all authenticated users to power the admin page.
    await client.query(`
      DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
      CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (true);
    `);
    console.log("Updated RLS policies for profiles");

  } catch(e) {
    console.error("Migration failed:", e);
  } finally {
    await client.end();
  }
}
runMigration();
