const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres"
});

async function init() {
  try {
    await client.connect();
    console.log("Connected to Supabase!");
    
    // Create sync_queue table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        entity_name TEXT NOT NULL,
        entity_id UUID NOT NULL,
        operation_type TEXT NOT NULL,
        payload JSONB,
        version INT DEFAULT 1,
        source_platform TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        processed_at TIMESTAMPTZ
      );
    `);
    console.log("Table 'sync_queue' verified/created!");
    
    // Also create sync_audit_log if it doesn't exist (from the same plan)
    await client.query(`
      CREATE TABLE IF NOT EXISTS sync_audit_log (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        entity_name TEXT NOT NULL,
        operation_type TEXT NOT NULL,
        previous_version JSONB,
        new_version JSONB,
        source_platform TEXT NOT NULL,
        sync_status TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("Table 'sync_audit_log' verified/created!");

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

init();
