const { Client } = require('pg');

const client = new Client({ 
  connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres" 
});

async function seed() {
  await client.connect();
  try {
    const permissions = [
      { resource: 'users', action: 'manage' },
      { resource: 'roles', action: 'manage' },
      { resource: 'subscriptions', action: 'manage' },
      { resource: 'exercises', action: 'manage' },
      { resource: 'templates', action: 'manage' },
      { resource: 'media', action: 'manage' },
      { resource: 'settings', action: 'manage' },
      { resource: 'analytics', action: 'view' },
      { resource: 'audit_logs', action: 'view' }
    ];

    for (const p of permissions) {
      await client.query(`
        INSERT INTO permissions (resource, action)
        VALUES ($1, $2)
        ON CONFLICT (resource, action) DO NOTHING
      `, [p.resource, p.action]);
    }
    console.log("Permissions seeded successfully!");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
seed();
