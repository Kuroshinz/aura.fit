// Test login THẬT bằng Playwright — dùng biến môi trường AURA_TEST_PASSWORD
// Cách chạy: $env:AURA_TEST_PASSWORD='...'; node scripts/debug-real-login.js
const { chromium } = require('playwright-core');

const EMAIL = 'nhanfreefire123456789@gmail.com';
const PASSWORD = process.env.AURA_TEST_PASSWORD;

async function main() {
  if (!PASSWORD) {
    console.log('⚠️ Chưa có password. Gán biến môi trường:');
    console.log('  $env:AURA_TEST_PASSWORD = "password-của-bạn"; node scripts/debug-real-login.js');
    process.exit(0);
  }

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text().slice(0, 300));
      console.log('❌ CONSOLE ERROR:', msg.text().slice(0, 300));
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push('PAGEERROR: ' + err.message.slice(0, 400));
    console.log('💥 PAGE ERROR:', err.message.slice(0, 400));
  });

  console.log('=== 1. Mở /login ===');
  await page.goto('https://aurafitiris.vercel.app/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // Fill login form
  console.log('=== 2. Điền email/password ===');
  const inputs = page.locator('input');
  const count = await inputs.count();
  console.log('Số input:', count);
  for (let i = 0; i < count; i++) {
    const type = await inputs.nth(i).getAttribute('type');
    const id = await inputs.nth(i).getAttribute('id');
    console.log(`  input[${i}]: type=${type} id=${id}`);
  }

  // Fill by type
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const passInput = page.locator('input[type="password"], input[name="password"]').first();
  await emailInput.fill(EMAIL);
  await passInput.fill(PASSWORD);

  // Click login button
  const loginBtn = page.locator('button[type="submit"], button:has-text("ĐĂNG NHẬP"), button:has-text("Đăng nhập")').first();
  await loginBtn.click();
  console.log('=== 3. Đã click login, chờ redirect ===');
  await page.waitForTimeout(6000);

  console.log('URL sau login:', page.url());

  // Check what page we're on
  const text = await page.evaluate(() => document.body?.innerText?.slice(0, 500) || 'EMPTY');
  console.log('Body text:', text.replace(/\n+/g, ' | ').slice(0, 400));

  // If on dashboard, try navigating to /dashboard/admin
  if (!page.url().includes('login')) {
    console.log('=== 4. Đã đăng nhập! Vào /dashboard/admin ===');
    await page.goto('https://aurafitiris.vercel.app/dashboard/admin', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(6000);
    console.log('URL admin:', page.url());
    const adminText = await page.evaluate(() => document.body?.innerText?.slice(0, 800) || 'EMPTY');
    console.log('Admin body:', adminText.replace(/\n+/g, ' | ').slice(0, 600));
    await page.screenshot({ path: 'C:/Users/nhan/.gemini/antigravity-ide/brain/cbc0e8ac-9a60-471d-9079-bb69393a70ca/admin-loggedin-debug.png' });
  }

  await page.screenshot({ path: 'C:/Users/nhan/.gemini/antigravity-ide/brain/cbc0e8ac-9a60-471d-9079-bb69393a70ca/login-result.png' });
  console.log('\n=== Console errors:', consoleErrors.length, '===');
  consoleErrors.forEach(e => console.log('  -', e.slice(0, 200)));

  await browser.close();
  process.exit(0);
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
