const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres"
});

async function initNewTable() {
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS exercises_catalog (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        body_part VARCHAR(100),
        equipment VARCHAR(100),
        instructions_en TEXT,
        instructions_es TEXT,
        instructions_it TEXT,
        instructions_tr TEXT,
        instructions_ru TEXT,
        instructions_zh TEXT,
        instructions_hi TEXT,
        instructions_pl TEXT,
        instructions_ko TEXT,
        instructions_fr TEXT,
        muscle_group VARCHAR(100),
        secondary_muscles JSONB,
        target VARCHAR(100),
        image VARCHAR(500),
        gif_url VARCHAR(500),
        created_at TIMESTAMPTZ
      );
    `);
    console.log("Table 'exercises_catalog' created!");
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
initNewTable();
