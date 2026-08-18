// Debug đầy đủ: login thật bằng Playwright rồi vào /dashboard/admin
// Mục tiêu: tái hiện chính xác lỗi "không hiện gì" sau khi đăng nhập
const { chromium } = require('playwright-core');

const EMAIL = 'nhanfreefire123456789@gmail.com';
const PASSWORD = '';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Bắt console + errors
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[console.${msg.type()}]`, msg.text().slice(0, 300));
    }
  });
  page.on('pageerror', (err) => {
    console.log('💥 PAGE ERROR:', err.message.slice(0, 500));
  });
  page.on('requestfailed', (req) => {
    console.log('🌐 FAILED:', req.url().slice(0, 120), '→', req.failure()?.errorText);
  });

  // 1. Vào login
  console.log('=== 1. Mở /login ===');
  await page.goto('https://aurafitiris.vercel.app/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // In nội dung form login
  const loginText = await page.evaluate(() => document.body?.innerText?.slice(0, 400) || 'EMPTY');
  console.log('Login page text:', loginText.replace(/\n+/g, ' | ').slice(0, 300));

  // 2. Tìm input email/password
  const inputs = await page.locator('input').count();
  console.log('Số input:', inputs);
  for (let i = 0; i < inputs; i++) {
    const type = await page.locator('input').nth(i).getAttribute('type');
    const placeholder = await page.locator('input').nth(i).getAttribute('placeholder');
    console.log(`  input[${i}]: type=${type} placeholder=${placeholder}`);
  }

  await browser.close();
  console.log('=== XONG - chưa đăng nhập (cần password từ user) ===');
  process.exit(0);
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
