import logging
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel, Field
from config import config

logger = logging.getLogger("aura_fit.webhook")

router = APIRouter(prefix="/api", tags=["Webhook"])

class WebhookPayload(BaseModel):
    event_type: str = Field(..., json_schema_extra={"example": "workout_completed"}) # workout_completed, pr_achieved, streak_milestone
    user_email: str = Field(..., json_schema_extra={"example": "user@aura.fit"})
    user_name: str = Field(..., json_schema_extra={"example": "John Doe"})
    title: str = Field(..., json_schema_extra={"example": "🏋️ Workout Session Finished!"})
    message: str = Field(..., json_schema_extra={"example": "Completed Push Day with 14,500 kg volume."})
    telegram_chat_id: Optional[str] = Field(default=None)
    metrics: Optional[Dict[str, Any]] = Field(default=None)

@router.post("/webhook", status_code=status.HTTP_200_OK)
async def receive_webhook(
    payload: WebhookPayload,
    x_webhook_secret: Optional[str] = Header(None, alias="X-Webhook-Secret")
):
    """
    FastAPI Webhook endpoint to receive push notifications from AURA.FIT Next.js Web App.
    """
    logger.info(f"Received webhook secret: {x_webhook_secret}")
    # Verify signature secret
    if config.WEBHOOK_SECRET and x_webhook_secret != config.WEBHOOK_SECRET:
        logger.warning(f"Unauthorized webhook attempt from email: {payload.user_email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-Webhook-Secret header"
        )

    logger.info(f"📩 Webhook event received: '{payload.event_type}' for {payload.user_email}")

    # Import bot dispatch references dynamically
    from bots.telegram_bot import send_telegram_notification, get_telegram_app

    dispatch_results = {"telegram": False}

    # Dispatch to Telegram
    target_telegram_chat = payload.telegram_chat_id or config.DEFAULT_TELEGRAM_CHAT_ID
    if target_telegram_chat:
        telegram_app = get_telegram_app()
        if telegram_app:
            tele_msg = f"🏆 *{payload.title}*\n\nAthlete: *{payload.user_name}*\n{payload.message}"
            success, err_msg = await send_telegram_notification(
                app=telegram_app,
                chat_id=target_telegram_chat,
                text=tele_msg
            )
            dispatch_results["telegram"] = success
            if not success:
                dispatch_results["telegram_error"] = err_msg or "Không thể gửi tin nhắn"
        else:
            dispatch_results["telegram_error"] = "Bot Telegram chưa được khởi tạo trên server"
    else:
        dispatch_results["telegram_error"] = "Thiếu Telegram Chat ID (Vui lòng nhập ID dạng số)"

    return {
        "status": "success",
        "event_type": payload.event_type,
        "dispatched": dispatch_results
    }
