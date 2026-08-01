import { NextResponse } from 'next/server'
import { sendTelegramWebhook } from '@/lib/telegram-webhook'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Send to Telegram using Webhook
    await sendTelegramWebhook({
      event_type: 'test_notification', // Fallback to existing type to ensure compatibility
      user_email: 'System',
      user_name: 'AURA.FIT Monitor',
      title: '⚠️ SYSTEM ERROR DETECTED',
      message: `Error: ${body.message}\n\nStack: ${body.stack?.substring(0, 200)}...`,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
