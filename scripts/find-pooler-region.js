const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const PASS = 'nguyenthiennhan3062010';
const REF = 'ojaqmtpjorszxwpkacus';

// Try all common Supabase pooler regions
const regions = [
  'ap-southeast-1', // Singapore (Render bot region)
  'us-east-1',
  'us-west-1',
  'eu-central-1',
  'eu-west-1',
  'ap-northeast-1',
  'ap-southeast-2',
  'sa-east-1',
  'ca-central-1',
];

async function test(url, name) {
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 6000 });
  try {
    await client.connect();
    const res = await client.query('SELECT 1 AS ok');
    await client.end();
    return { ok: true, result: res.rows[0] };
  } catch (e) {
    await client.end().catch(() => {});
    return { ok: false, error: e.message.slice(0, 150) };
  }
}

async function main() {
  for (const region of regions) {
    const url = `postgresql://postgres.${REF}:${PASS}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
    process.stdout.write(`🔌 ${region} ... `);
    const r = await test(url, region);
    if (r.ok) {
      console.log('✅ WORKS!');
      console.log(`\n🎉 REGION FOUND: ${region}`);
      console.log(`URL: ${url.replace(PASS, '***')}`);
    } else {
      console.log(`❌ ${r.error.slice(0, 80)}`);
    }
  }
  process.exit(0);
}
main();
