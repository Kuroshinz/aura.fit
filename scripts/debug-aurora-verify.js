// Verify aurora theme: chụp screenshot + đo màu sidebar sau deploy
const { chromium } = require('playwright-core');

const EMAIL = 'nhanfreefire123456789@gmail.com';
const PASSWORD = process.env.AURA_TEST_PASSWORD;

async function main() {
  if (!PASSWORD) { console.log('Missing AURA_TEST_PASSWORD'); process.exit(1); }

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto('https://aurafitiris.vercel.app/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(5000);

  await page.goto('https://aurafitiris.vercel.app/dashboard/admin', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(5000);

  // Đo màu thực tế sidebar + nền
  const colors = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    const adminArea = document.querySelector('[data-admin-area]');
    const link = document.querySelector('aside a');
    const asideStyle = getComputedStyle(aside);
    const areaStyle = adminArea ? getComputedStyle(adminArea) : null;
    const linkStyle = link ? getComputedStyle(link) : null;
    return {
      asideBg: asideStyle.backgroundColor,
      asideBorder: asideStyle.borderRightColor,
      areaBg: areaStyle?.backgroundImage?.slice(0, 100) || 'N/A',
      linkColor: linkStyle?.color || 'N/A',
    };
  });
  console.log('🎨 Colors:', JSON.stringify(colors, null, 2));

  await page.screenshot({ path: 'C:/Users/nhan/.gemini/antigravity-ide/brain/cbc0e8ac-9a60-471d-9079-bb69393a70ca/admin-aurora-final.png' });
  console.log('📸 Screenshot saved');

  await browser.close();
  process.exit(0);
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
