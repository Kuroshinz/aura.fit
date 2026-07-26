export interface TelegramWebhookPayload {
  event_type: 'workout_completed' | 'pr_achieved' | 'test_notification' | 'streak_milestone';
  user_email: string;
  user_name: string;
  title: string;
  message: string;
  telegram_chat_id?: string;
  metrics?: Record<string, any>;
}

export async function sendTelegramWebhook(payload: TelegramWebhookPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('http://localhost:8000/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': 'aura_fit_super_secret_webhook_key_2026',
      },
      body: JSON.stringify(payload),
    });

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
    return { success: false, error: err.message || 'Lỗi kết nối tới Python Backend' };
  }
}
