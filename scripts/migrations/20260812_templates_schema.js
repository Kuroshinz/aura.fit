const { Client } = require('pg');

const client = new Client({ 
  connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres" 
});

async function migrate() {
  await client.connect();
  try {
    await client.query(`
      ALTER TABLE routines 
      ADD COLUMN IF NOT EXISTS is_global_template BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS difficulty TEXT,
      ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
    `);
    console.log("Routines table migrated successfully!");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
migrate();
