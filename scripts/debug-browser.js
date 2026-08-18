// Debug script: mở AURA.FIT production bằng Playwright, bắt console errors, chụp screenshot
const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Bắt mọi console message
  const consoleLogs = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text.slice(0, 300)}`);
    if (msg.type() === 'error') {
      console.log('❌ CONSOLE ERROR:', text.slice(0, 500));
    }
  });

  // Bắt page errors
  page.on('pageerror', (err) => {
    console.log('💥 PAGE ERROR:', err.message.slice(0, 500));
  });

  // Bắt request failures
  page.on('requestfailed', (req) => {
    console.log('🌐 REQUEST FAILED:', req.url().slice(0, 150), '→', req.failure()?.errorText);
  });

  console.log('=== Mở /dashboard/admin ===');
  try {
    await page.goto('https://aurafitiris.vercel.app/dashboard/admin', { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.log('⚠️ goto timeout (networkidle không đạt, thử load)', e.message.slice(0, 100));
    await page.waitForTimeout(5000);
  }
  await page.waitForTimeout(5000);

  // Lấy nội dung body
  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 500) || 'EMPTY BODY');
  console.log('=== BODY TEXT ===');
  console.log(bodyText);

  const bodyHTML = await page.evaluate(() => document.body?.innerHTML?.slice(0, 800) || 'EMPTY');
  console.log('=== BODY HTML (first 800) ===');
  console.log(bodyHTML);

  await page.screenshot({ path: 'C:/Users/nhan/.gemini/antigravity-ide/brain/cbc0e8ac-9a60-471d-9079-bb69393a70ca/admin-page-debug.png' });
  console.log('📸 Screenshot đã lưu');

  console.log('\n=== Console logs (all) ===');
  for (const l of consoleLogs.slice(0, 30)) console.log(l);

  await browser.close();
  process.exit(0);
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
