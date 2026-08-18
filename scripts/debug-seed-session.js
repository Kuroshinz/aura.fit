// Test AURA.FIT với session giả: seed localStorage profile admin rồi mở /dashboard/admin
// KHÔNG cần password thật — kiểm tra UI render + console errors
const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text().slice(0, 400));
      console.log('❌ CONSOLE ERROR:', msg.text().slice(0, 400));
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push('PAGEERROR: ' + err.message.slice(0, 400));
    console.log('💥 PAGE ERROR:', err.message.slice(0, 400));
  });
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (!url.includes('supabase') && !url.includes('chunk')) return;
    console.log('🌐 FAILED:', url.slice(0, 120), '→', req.failure()?.errorText);
  });

  // 1. Seed localStorage admin profile + session
  console.log('=== Seed localStorage ===');
  await page.goto('https://aurafitiris.vercel.app/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => {
    localStorage.setItem('aura_fit_accounts_db', JSON.stringify({
      'nhanfreefire123456789@gmail.com': {
        email: 'nhanfreefire123456789@gmail.com',
        fullName: 'Admin Test',
        role: 'admin',
        profile: { name: 'Admin Test', age: 22, role: 'admin' },
        workoutHistory: [],
        customRoutine: null,
        activeWorkout: null
      }
    }));
    localStorage.setItem('aura_fit_current_session_email', 'nhanfreefire123456789@gmail.com');
    localStorage.setItem('gym-user-profile-storage', JSON.stringify({
      state: {
        profile: { name: 'Admin Test', age: 22, role: 'admin', gender: 'male', height_cm: 175, weight_kg: 70, body_fat: null, experience: 'beginner', goal: 'recomposition', sessions_per_week: 3, metrics_history: [] },
        isOnboardingComplete: true
      },
      version: 0
    }));
  });

  // 2. Vào /dashboard/admin
  console.log('=== Mở /dashboard/admin (với localStorage seeded) ===');
  await page.goto('https://aurafitiris.vercel.app/dashboard/admin', { waitUntil: 'networkidle', timeout: 30000 }).catch(e => console.log('timeout:', e.message.slice(0, 80)));
  await page.waitForTimeout(6000);

  const url = page.url();
  console.log('URL hiện tại:', url);

  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 600) || 'EMPTY BODY');
  console.log('=== BODY TEXT ===');
  console.log(bodyText.replace(/\n+/g, ' | ').slice(0, 500));

  // Check if on login page (redirected)
  if (url.includes('login')) {
    console.log('\n⚠️ BỊ REDIRECT VỀ LOGIN!');
  }

  if (bodyText.trim().length === 0) {
    console.log('\n🚨 BLANK PAGE — body trống!');
  }

  await page.screenshot({ path: 'C:/Users/nhan/.gemini/antigravity-ide/brain/cbc0e8ac-9a60-471d-9079-bb69393a70ca/admin-seeded-debug.png' });
  console.log('📸 Screenshot đã lưu');

  console.log('\n=== Tổng console errors:', consoleErrors.length, '===');
  if (consoleErrors.length === 0) console.log('Không có console error nào!');

  await browser.close();
  process.exit(0);
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
