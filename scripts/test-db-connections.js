const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const PASS = 'nguyenthiennhan3062010';
const REF = 'ojaqmtpjorszxwpkacus';

const candidates = [
  { name: 'direct (current)', url: `postgresql://postgres:${PASS}@db.${REF}.supabase.co:5432/postgres` },
  { name: 'pooler generic :5432', url: `postgresql://postgres.${REF}:${PASS}@${REF}.pooler.supabase.com:5432/postgres` },
  { name: 'pooler generic :6543', url: `postgresql://postgres.${REF}:${PASS}@${REF}.pooler.supabase.com:6543/postgres` },
  { name: 'pooler aws0 :6543', url: `postgresql://postgres.${REF}:${PASS}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres` },
  { name: 'pooler aws0 + ref :6543', url: `postgresql://postgres.${REF}:${PASS}@aws-0-ap-southeast-1.${REF}.pooler.supabase.com:6543/postgres` },
  { name: 'pooler aws0 + ref :5432', url: `postgresql://postgres.${REF}:${PASS}@aws-0-ap-southeast-1.${REF}.pooler.supabase.com:5432/postgres` },
];

async function test(c) {
  const client = new Client({ connectionString: c.url, connectionTimeoutMillis: 8000 });
  try {
    await client.connect();
    const res = await client.query('SELECT 1 AS ok');
    await client.end();
    return { ok: true, result: res.rows[0] };
  } catch (e) {
    await client.end().catch(() => {});
    return { ok: false, error: e.message.slice(0, 120) };
  }
}

async function main() {
  for (const c of candidates) {
    console.log(`\n🔌 ${c.name}`);
    console.log(`   ${c.url.replace(PASS, '***')}`);
    const r = await test(c);
    console.log(r.ok ? '   ✅ WORKS!' : `   ❌ ${r.error}`);
  }
  process.exit(0);
}
main();
