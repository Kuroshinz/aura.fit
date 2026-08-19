// Verify: điều hướng client-side giữa các trang admin KHÔNG cần hard refresh
// Login → /dashboard/admin → BẤM menu Users (client nav) → kiểm tra dữ liệu load
const { chromium } = require('playwright-core');

const EMAIL = 'nhanfreefire123456789@gmail.com';
const PASSWORD = process.env.AURA_TEST_PASSWORD;

async function main() {
  if (!PASSWORD) { console.log('Missing AURA_TEST_PASSWORD'); process.exit(1); }

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Login
  await page.goto('https://aurafitiris.vercel.app/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(5000);

  // Vào admin dashboard
  await page.goto('https://aurafitiris.vercel.app/dashboard/admin', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(4000);
  console.log('1. Admin dashboard OK:', page.url());

  // BẤM menu "Users" (client-side navigation, KHÔNG hard refresh)
  console.log('2. Bấm menu Users (client nav)...');
  const usersLink = page.locator('aside a:has-text("Users")').first();
  await usersLink.click();
  await page.waitForTimeout(4000);

  console.log('   URL sau click:', page.url());
  const usersText = await page.evaluate(() => document.body?.innerText?.slice(0, 600) || 'EMPTY');
  console.log('   Users page text:', usersText.replace(/\n+/g, ' | ').slice(0, 400));

  const loadedUsers = usersText.includes('@') || usersText.includes('gmail') || usersText.includes('Email');
  console.log('   → Dữ liệu users load (không refresh)?', loadedUsers ? '✅ CÓ' : '❌ KHÔNG');

  // Bấm menu "Exercises"
  console.log('3. Bấm menu Exercises (client nav)...');
  const exLink = page.locator('aside a:has-text("Exercises")').first();
  await exLink.click();
  await page.waitForTimeout(4000);

  console.log('   URL sau click:', page.url());
  const exText = await page.evaluate(() => document.body?.innerText?.slice(0, 500) || 'EMPTY');
  console.log('   Exercises page text:', exText.replace(/\n+/g, ' | ').slice(0, 300));

  await page.screenshot({ path: 'C:/Users/nhan/.gemini/antigravity-ide/brain/cbc0e8ac-9a60-471d-9079-bb69393a70ca/admin-client-nav-verify.png' });
  console.log('📸 Screenshot saved');

  await browser.close();
  process.exit(0);
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
