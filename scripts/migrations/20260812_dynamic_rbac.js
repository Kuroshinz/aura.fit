const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres" });

async function migrate() {
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        is_system BOOLEAN DEFAULT false
      );
      
      CREATE TABLE IF NOT EXISTS permissions (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        resource TEXT NOT NULL,
        action TEXT NOT NULL,
        UNIQUE(resource, action)
      );

      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
        permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY(role_id, permission_id)
      );

      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        tier_name TEXT UNIQUE NOT NULL,
        feature_limits JSONB DEFAULT '{}'::jsonb
      );

      ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id),
        ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id),
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
    `);
    console.log("Migration successful!");
  } catch(e) { console.error(e); process.exit(1); }
  process.exit(0);
}
migrate();
