export interface TelegramWebhookPayload {
  event_type: 'workout_completed' | 'pr_achieved' | 'test_notification' | 'streak_milestone' | 'routine_scheduled';
  user_email: string;
  user_name: string;
  title: string;
  message: string;
  telegram_chat_id?: string;
  metrics?: Record<string, any>;
}

export async function sendTelegramWebhook(payload: TelegramWebhookPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'http://localhost:8000/api/webhook'
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000) // 25s timeout for Render cold start

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.NEXT_PUBLIC_WEBHOOK_SECRET || '',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${errText}` };
    }

    const data = await res.json();
    if (data.dispatched && data.dispatched.telegram === false) {
      return { success: false, error: data.dispatched.telegram_error || 'Lỗi gửi tin nhắn Telegram' };
    }
    
    return { success: true };
  } catch (err: any) {
    const url = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'http://localhost:8000/api/webhook'
    if (err.name === 'AbortError') {
      return { success: false, error: `⏱️ Quá thời gian chờ (25s) khi kết nối đến ${url}. Render free tier có thể đang ngủ, thử lại sau 30s.` }
    }
    return { success: false, error: `❌ Không thể kết nối đến ${url} — ${err.message || 'Lỗi mạng'}` }
  }
}
