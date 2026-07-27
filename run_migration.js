require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  await client.connect();
  console.log('Connected to DB');
  try {
    await client.query(`
      ALTER TABLE public.routines 
      ADD COLUMN IF NOT EXISTS schedule_data JSONB,
      ADD COLUMN IF NOT EXISTS split_id TEXT,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
    `);
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
