const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres" });

async function migrate() {
  await client.connect();
  try {
    // 1. Add columns to exercises table
    await client.query(`
      ALTER TABLE public.exercises 
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS instructions JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'beginner';
    `);
    console.log("Columns added to exercises table.");

    // 2. Create Storage Bucket for exercise-media
    await client.query(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('exercise-media', 'exercise-media', true)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("Storage bucket created.");

    // 3. Setup Storage RLS Policies (Allow public read, allow insert/update for all for now)
    // In production, we'd restrict INSERT to auth.uid() or admins, but here we keep it simple for the migration.
    await client.query(`
      CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'exercise-media');
      CREATE POLICY "Insert Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'exercise-media');
      CREATE POLICY "Update Access" ON storage.objects FOR UPDATE USING (bucket_id = 'exercise-media');
      CREATE POLICY "Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'exercise-media');
    `).catch(e => {
        // Policies might already exist, ignore errors for policy creation.
        console.log("Policies might already exist.");
    });

    console.log("Migration successful!");
  } catch(e) { 
    console.error(e); 
    process.exit(1); 
  }
  process.exit(0);
}
migrate();
