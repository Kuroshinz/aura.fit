/**
 * Local cron scheduler — gọi endpoint gửi lịch tập Telegram mỗi ngày lúc 07:00.
 *
 * Cách chạy (PowerShell):
 *   node scripts/cron-scheduler.js
 *
 * Lịch (giờ máy local):
 *   07:00 — Gửi lịch tập hôm nay tới Telegram
 *   23:00 — Health check
 */
const TARGET_URL = process.env.CRON_URL || 'http://localhost:3000/api/cron/send-daily-routines'
const CRON_SECRET = process.env.CRON_SECRET || 'aura-dev-secret'

/** Sleep helper */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Compute next 07:00 */
function next7am() {
  const now = new Date()
  const next = new Date(now)
  next.setHours(7, 0, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  return next
}

async function triggerCron() {
  try {
    const res = await fetch(TARGET_URL, {
      headers: { 'X-Cron-Secret': CRON_SECRET },
      signal: AbortSignal.timeout(60000),
    })
    const body = await res.json().catch(() => ({}))
    console.log(`[Cron] ${new Date().toISOString()} → HTTP ${res.status}`, JSON.stringify(body))
  } catch (err) {
    console.error(`[Cron] ${new Date().toISOString()} ❌`, err.message)
  }
}

async function main() {
  console.log('🕖 Cron scheduler started. Will fire daily at 07:00.')
  console.log(`   Endpoint: ${TARGET_URL}`)

  // Run immediately on start (useful for testing), then schedule
  await triggerCron()

  while (true) {
    const target = next7am()
    const waitMs = target.getTime() - Date.now()
    console.log(`   Next run: ${target.toLocaleString('vi-VN')} (in ${Math.round(waitMs / 3600000)}h)`)
    await sleep(waitMs)
    await triggerCron()
  }
}

main().catch(console.error)
