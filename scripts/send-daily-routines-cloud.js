/**
 * Standalone daily routine sender — chạy trên GitHub Actions cloud.
 * Không cần Next.js/API route — tự kết nối DB, tự gửi webhook.
 *
 * Kích hoạt: .github/workflows/daily-telegram.yml
 * Lịch: Mỗi ngày 00:00 UTC = 07:00 sáng giờ Việt Nam
 */
const { Pool } = require('pg');
const dns = require('dns');

// GitHub Actions runners sometimes have no IPv6 route — force IPv4.
// Fixes: ENETUNREACH 2406:da1c:...:5432
dns.setDefaultResultOrder('ipv4first');

const DATABASE_URL = process.env.DATABASE_URL;
// Supabase pooler (transaction mode) — has IPv4 records, works on GitHub Actions.
// ✅ Verified: project region is ap-southeast-2 (Sydney). Direct DB host is IPv6-only.
const POOLER_URL = process.env.POOLER_URL ||
  'postgresql://postgres.ojaqmtpjorszxwpkacus:nguyenthiennhan3062010@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres';
const ACTIVE_URL = POOLER_URL || DATABASE_URL;
const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://aura-fit-bot.onrender.com/api/webhook';
const WEBHOOK_SECRET = process.env.NEXT_PUBLIC_WEBHOOK_SECRET || '';

// ─── Mapping split mặc định (PPL/UL 5 ngày) ───
const SPLIT_MAPPING = ['Push', 'Pull', 'Legs', 'Rest', 'Upper', 'Lower', 'Rest'];

function getTodayInfo() {
  const now = new Date();
  const dayIndex = (now.getDay() + 6) % 7; // Monday=0 ... Sunday=6
  const suggestedDayKey = SPLIT_MAPPING[dayIndex];
  const dateFormatted = now.toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit',
  });
  return { suggestedDayKey, dateFormatted };
}

async function main() {
  if (!ACTIVE_URL) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  const todayInfo = getTodayInfo();
  const todayKey = todayInfo.suggestedDayKey;
  console.log(`📅 Hôm nay: ${todayInfo.dateFormatted} → ${todayKey}`);

  if (todayKey === 'Rest') {
    console.log('😴 Ngày nghỉ — không gửi lịch tập.');
    process.exit(0);
  }

  const pool = new Pool({
    connectionString: ACTIVE_URL,
    max: 5,
    family: 4, // force IPv4 (GitHub Actions has no IPv6 route)
  });
  try {
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
    `);

    console.log(`👥 Tìm thấy ${rows.length} người dùng cần gửi lịch.`);

    const sent = [];
    const failed = [];

    for (const p of rows) {
      if (!p.schedule_data?.days) {
        failed.push({ email: p.email, reason: 'Chưa có giáo án hoạt động' });
        continue;
      }

      const normalizedToday = todayKey.toLowerCase().replace(/\s+/g, '');
      const todayDay = p.schedule_data.days.find((d) =>
        (d.dayName || '').toLowerCase().replace(/\s+/g, '') === normalizedToday
      ) || p.schedule_data.days[0];

      if (!todayDay) {
        failed.push({ email: p.email, reason: 'Không tìm thấy ngày tập' });
        continue;
      }

      const exList = (todayDay.exercises || [])
        .map((e) => `• ${e.exerciseName || 'Bài tập'} (${e.sets || 3} sets x ${e.reps || 10})`)
        .join('\n');

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
              'Số bài tập': (todayDay.exercises || []).length,
            },
          }),
          signal: AbortSignal.timeout(25000),
        });

        if (res.ok) {
          sent.push(p.email || 'unknown');
          console.log(`✅ Gửi thành công → ${p.email || 'unknown'}`);
        } else {
          failed.push({ email: p.email, reason: `HTTP ${res.status}` });
          console.error(`❌ HTTP ${res.status} → ${p.email}`);
        }
      } catch (err) {
        failed.push({ email: p.email, reason: err.message || 'Lỗi mạng' });
        console.error(`❌ Lỗi → ${p.email}: ${err.message}`);
      }

      // Tránh spam webhook — nghỉ 300ms giữa các user
      await new Promise((r) => setTimeout(r, 300));
    }

    console.log('');
    console.log('══════ KẾT QUẢ ══════');
    console.log(`✅ Thành công: ${sent.length}`);
    console.log(`❌ Thất bại: ${failed.length}`);
    if (failed.length > 0) {
      console.log('Chi tiết lỗi:', JSON.stringify(failed.slice(0, 10), null, 2));
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('❌ Lỗi tổng thể:', err);
  process.exit(1);
});
