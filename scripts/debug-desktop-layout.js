// Chụp screenshot admin panel trên desktop (1440px) để đánh giá layout
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

  // Vào admin
  await page.goto('https://aurafitiris.vercel.app/dashboard/admin', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'C:/Users/nhan/.gemini/antigravity-ide/brain/cbc0e8ac-9a60-471d-9079-bb69393a70ca/admin-desktop-1440.png', fullPage: false });

  // Đo kích thước sidebar + main
  const dims = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    const main = document.querySelector('main');
    return {
      asideW: aside?.getBoundingClientRect().width || 0,
      asideH: aside?.getBoundingClientRect().height || 0,
      mainW: main?.getBoundingClientRect().width || 0,
      mainLeft: main?.getBoundingClientRect().left || 0,
      viewportW: window.innerWidth,
      bodyTextLen: document.body?.innerText?.length || 0,
    };
  });
  console.log('Layout dims:', JSON.stringify(dims, null, 2));

  // Cũng chụp mobile viewport để so sánh
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/Users/nhan/.gemini/antigravity-ide/brain/cbc0e8ac-9a60-471d-9079-bb69393a70ca/admin-mobile-390.png' });

  await browser.close();
  console.log('Screenshots saved');
  process.exit(0);
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
