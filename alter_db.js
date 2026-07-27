const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres"
});

async function alterTable() {
  await client.connect();
  try {
    await client.query(`
      ALTER TABLE exercises
      ADD COLUMN IF NOT EXISTS category VARCHAR(100),
      ADD COLUMN IF NOT EXISTS body_part VARCHAR(100),
      ADD COLUMN IF NOT EXISTS instructions_en TEXT,
      ADD COLUMN IF NOT EXISTS instructions_es TEXT,
      ADD COLUMN IF NOT EXISTS instructions_it TEXT,
      ADD COLUMN IF NOT EXISTS instructions_tr TEXT,
      ADD COLUMN IF NOT EXISTS instructions_ru TEXT,
      ADD COLUMN IF NOT EXISTS instructions_zh TEXT,
      ADD COLUMN IF NOT EXISTS instructions_hi TEXT,
      ADD COLUMN IF NOT EXISTS instructions_pl TEXT,
      ADD COLUMN IF NOT EXISTS instructions_ko TEXT,
      ADD COLUMN IF NOT EXISTS instructions_fr TEXT,
      ADD COLUMN IF NOT EXISTS secondary_muscles JSONB,
      ADD COLUMN IF NOT EXISTS target VARCHAR(100),
      ADD COLUMN IF NOT EXISTS image VARCHAR(500),
      ADD COLUMN IF NOT EXISTS gif_url VARCHAR(500);
    `);
    console.log("Table successfully altered with new columns!");
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
alterTable();
