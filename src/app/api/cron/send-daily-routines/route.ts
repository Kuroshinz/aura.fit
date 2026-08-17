import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import { getTodayWorkoutMapping } from '@/lib/utils/date-schedule'

// Allow longer execution for cron
export const maxDuration = 60

const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://aura-fit-bot.onrender.com/api/webhook'
const WEBHOOK_SECRET = process.env.NEXT_PUBLIC_WEBHOOK_SECRET || ''
const DATABASE_URL = process.env.DATABASE_URL || ''
// Pooler has IPv4 records — works in all environments (GitHub Actions has no IPv6)
const POOLER_URL = process.env.POOLER_URL ||
  'postgresql://postgres.ojaqmtpjorszxwpkacus:nguyenthiennhan3062010@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres'
const ACTIVE_URL = POOLER_URL || DATABASE_URL

/**
 * CRON endpoint — gửi lịch tập hôm nay tới Telegram cho tất cả người dùng
 * đã bật auto_send_routine và có telegram_chat_id.
 *
 * Bảo vệ bằng header: X-Cron-Secret hoặc Authorization: Bearer $CRON_SECRET
 * (định dạng chuẩn của Vercel Cron Jobs).
 */
export async function GET(request: Request) {
  const auth = request.headers.get('x-cron-secret')
  const vercelAuth = request.headers.get('authorization')
  const vercelSecret = vercelAuth?.startsWith('Bearer ') ? vercelAuth.slice(7) : null
  const expected = process.env.CRON_SECRET
  const authorized = expected
    ? auth === expected || vercelSecret === expected
    : true

  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!ACTIVE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 })
  }

  const pool = new Pool({
    connectionString: ACTIVE_URL,
    max: 5,
    family: 4,
  })
  const todayInfo = getTodayWorkoutMapping('ppl_ul_5d')
  const todayKey = todayInfo.suggestedDayKey

  try {
    // Rest day → nothing to send
    if (todayKey === 'Rest') {
      await pool.end()
      return NextResponse.json({ skipped: true, reason: 'Rest day', date: todayInfo.dateFormatted })
    }

    const { rows } = await pool.query(`
      SELECT p.id, p.email, p.full_name, p.telegram_chat_id,
             r.schedule_data
      FROM profiles p
      LEFT JOIN routines r ON r.user_id = p.id AND r.is_active = true
      WHERE p.auto_send_routine = true
        AND p.telegram_chat_id IS NOT NULL
        AND p.telegram_chat_id != ''
        AND p.status = 'active'
        AND p.is_banned IS NOT TRUE
    `)

    const sent: string[] = []
    const failed: { email: string | null; reason: string }[] = []

    for (const p of rows) {
      if (!p.schedule_data?.days) {
        failed.push({ email: p.email, reason: 'No active routine' })
        continue
      }

      const normalizedToday = todayKey.toLowerCase().replace(/\s+/g, '')
      const todayDay = p.schedule_data.days.find((d: any) =>
        d.dayName?.toLowerCase().replace(/\s+/g, '') === normalizedToday
      ) || p.schedule_data.days[0]

      if (!todayDay) {
        failed.push({ email: p.email, reason: 'No matching day' })
        continue
      }

      const exList = todayDay.exercises
        .map((e: any) => `• ${e.exerciseName || 'Exercise'} (${e.sets || 3} sets x ${e.reps || 10})`)
        .join('\n')

      try {
        const res = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': WEBHOOK_SECRET,
          },
          body: JSON.stringify({
            event_type: 'routine_scheduled',
            user_email: p.email || `${(p.full_name || 'athlete').toLowerCase().replace(/\s+/g, '')}@aura.fit`,
            user_name: p.full_name || 'Vận động viên AURA',
            title: `📋 LỊCH TẬP HÔM NAY: ${todayDay.dayName}`,
            message: `Lịch tập ngày ${todayInfo.dateFormatted}:\n\n${exList}`,
            telegram_chat_id: p.telegram_chat_id,
            metrics: {
              'Ngày tập': todayDay.dayName,
              'Số bài tập': todayDay.exercises.length,
            },
          }),
          signal: AbortSignal.timeout(25000),
        })

        if (res.ok) {
          const data = await res.json().catch(() => ({}))
          if (data.dispatched && data.dispatched.telegram === false) {
            failed.push({ email: p.email, reason: data.dispatched.telegram_error || 'Telegram delivery failed' })
          } else {
            sent.push(p.email || 'unknown')
          }
        } else {
          failed.push({ email: p.email, reason: `HTTP ${res.status}` })
        }
      } catch (err: any) {
        failed.push({ email: p.email, reason: err.message || 'Network error' })
      }
    }

    await pool.end()
    return NextResponse.json({
      ok: true,
      date: todayInfo.dateFormatted,
      day: todayKey,
      sent: sent.length,
      failed: failed.length,
      sentTo: sent,
      failures: failed.slice(0, 10),
    })
  } catch (err: any) {
    await pool.end().catch(() => {})
    console.error('❌ Cron error:', err)
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
