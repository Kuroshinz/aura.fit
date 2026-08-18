// Verify: login thật → vào /dashboard/admin → chụp screenshot + đọc DOM
// Kiểm tra: sidebar AURA.FIT có bị ẩn không? Menu admin có hiện rõ không?
const { chromium } = require('playwright-core');

const EMAIL = 'nhanfreefire123456789@gmail.com';
const PASSWORD = process.env.AURA_TEST_PASSWORD;

async function main() {
  if (!PASSWORD) { console.log('Missing AURA_TEST_PASSWORD'); process.exit(1); }

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message.slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 200)); });

  // Login
  await page.goto('https://aurafitiris.vercel.app/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(5000);

  // Vào admin
  await page.goto('https://aurafitiris.vercel.app/dashboard/admin', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(4000);

  // Check: có bao nhiêu sidebar?
  const sidebarCount = await page.evaluate(() => {
    const asides = document.querySelectorAll('aside');
    return asides.length;
  });
  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 700) || 'EMPTY');
  console.log('Sidebar count:', sidebarCount);
  console.log('URL:', page.url());
  console.log('=== BODY TEXT ===');
  console.log(bodyText.replace(/\n+/g, ' | ').slice(0, 600));

  // Kiểm tra xem có text AURA.FIT nav (sidebar 1) không
  const hasAuraNav = bodyText.includes('LỊCH TẬP') || bodyText.includes('THƯ VIỆN');
  const hasNexusNav = bodyText.includes('NEXUS ADMIN') || bodyText.includes('Threat Monitor');
  console.log('\n=== KẾT QUẢ ===');
  console.log('Sidebar AURA.FIT hiện?', hasAuraNav ? '❌ VẪN HIỆN (lỗi)' : '✅ ĐÃ ẨN');
  console.log('Sidebar NEXUS ADMIN hiện?', hasNexusNav ? '✅ HIỆN' : '❌ KHÔNG HIỆN');

  await page.screenshot({ path: 'C:/Users/nhan/.gemini/antigravity-ide/brain/cbc0e8ac-9a60-471d-9079-bb69393a70ca/admin-final-verify.png' });
  console.log('📸 Screenshot lưu: admin-final-verify.png');

  console.log('\nErrors:', errors.length);
  errors.slice(0, 5).forEach(e => console.log('  -', e.slice(0, 150)));

  await browser.close();
  process.exit(0);
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
