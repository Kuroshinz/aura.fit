const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const WEBHOOK_URL = 'https://aura-fit-bot.onrender.com/api/webhook';
const secrets = [
  'aura_fit_super_secret_webhook_key_2026',
  'ausb_secret_1cmZZ_TeIOhrgSRP2kaJ4w_k2iPTWUM',
];

const payload = {
  event_type: 'test_notification',
  user_email: 'test@aura.fit',
  user_name: 'Test',
  title: '🔧 Test kết nối webhook',
  message: 'Hello từ script test!',
};

async function trySecret(secret) {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': secret,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    });
    const body = await res.text();
    console.log(`Secret [${secret.slice(0, 15)}...] → HTTP ${res.status}`);
    if (res.ok) console.log(`   ✅ WORKS! Body: ${body.slice(0, 120)}`);
  } catch (e) {
    console.log(`Secret [${secret.slice(0, 15)}...] → ❌ ${e.message}`);
  }
}

async function main() {
  console.log(`Testing ${WEBHOOK_URL}\n`);
  for (const s of secrets) await trySecret(s);
  process.exit(0);
}
main();
