// Verify: exercises page — drag handle, sort buttons, auto-save UI
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

  await page.goto('https://aurafitiris.vercel.app/dashboard/admin/exercises', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(5000);

  const info = await page.evaluate(() => {
    const gripCount = document.querySelectorAll('svg.lucide-grip-vertical').length;
    const arrowUp = document.querySelectorAll('svg.lucide-arrow-up').length;
    const chevronsUp = document.querySelectorAll('svg.lucide-chevrons-up').length;
    const hint = document.body.innerText.includes('Kéo (nút ≡)');
    const bodyText = document.body.innerText.slice(0, 300);
    return { gripCount, arrowUp, chevronsUp, hint, bodyText: bodyText.replace(/\n+/g, ' | ') };
  });
  console.log('=== EXERCISES PAGE VERIFY ===');
  console.log('GripVertical (drag):', info.gripCount, info.gripCount > 0 ? '✅' : '❌');
  console.log('ArrowUp/Down buttons:', info.arrowUp, info.arrowUp > 0 ? '✅' : '❌');
  console.log('Move-to-top buttons:', info.chevronsUp, info.chevronsUp > 0 ? '✅' : '❌');
  console.log('Hint text:', info.hint ? '✅' : '❌');
  console.log('Body:', info.bodyText.slice(0, 200));

  // Test: mở 1 bài tập → kiểm tra auto-save indicator
  const manageBtn = page.locator('button:has-text("Manage")').first();
  if (await manageBtn.count()) {
    await manageBtn.click();
    await page.waitForTimeout(2000);
    const slideover = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasAutosave: text.includes('Đã lưu') || text.includes('Đang lưu') || text.includes('tự động lưu'),
        hasDoneBtn: text.includes('DONE — ĐÃ TỰ ĐỘNG LƯU'),
      };
    });
    console.log('Slideover auto-save:', slideover.hasAutosave ? '✅' : '❌', '| Done btn:', slideover.hasDoneBtn ? '✅' : '❌');
    await page.screenshot({ path: 'C:/Users/nhan/.gemini/antigravity-ide/brain/cbc0e8ac-9a60-471d-9079-bb69393a70ca/exercises-autosave-verify.png' });
  }

  await browser.close();
  process.exit(0);
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
