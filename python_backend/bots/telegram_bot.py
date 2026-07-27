import logging
import re
import datetime
from typing import Optional
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
from config import config
from services.supabase_service import supabase_service

logger = logging.getLogger("aura_fit.telegram")

_telegram_app_instance = None

def set_telegram_app(app_instance: Application):
    global _telegram_app_instance
    _telegram_app_instance = app_instance

def get_telegram_app() -> Optional[Application]:
    return _telegram_app_instance

def escape_markdown(text: str) -> str:
    """Helper to escape MarkdownV2 special characters."""
    return re.sub(r'([_\[\]()~`>#+-=|{}.!])', r'\\\1', str(text))

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    msg_obj = update.effective_message
    if not msg_obj:
        return
    user_name = update.effective_user.first_name if update.effective_user else (update.effective_chat.title if update.effective_chat else "Athlete")
    msg = (
        f"👑 *Welcome to AURA\\.FIT, {escape_markdown(user_name)}\\!\*\n\n"
        f"Your personal AI Athletic Companion on Telegram\\.\n\n"
        f"• `/stats` \\- View total volume, streak \\& PRs\n"
        f"• `/routine` \\- Today's workout plan\n"
        f"• `/help` \\- Account linking \\& support\n"
    )
    await msg_obj.reply_text(msg, parse_mode="MarkdownV2")

async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    msg_obj = update.effective_message
    if not msg_obj:
        return
    user_id = str(update.effective_user.id) if update.effective_user else str(update.effective_chat.id if update.effective_chat else "unknown")
    stats = await supabase_service.get_user_stats(user_id)

    pr_lines = [f"• *{escape_markdown(pr['exercise'])}*: `{pr['weight_kg']} kg` x {pr['reps']}" for pr in stats['top_prs']]
    pr_str = "\n".join(pr_lines) if pr_lines else "No PRs recorded yet"

    msg = (
        f"👑 *ATHLETE STATS \\& ANALYTICS*\n"
        f"──────────────────────────\n"
        f"🔥 *Total Volume:* `{stats['total_volume']:,} kg`\n"
        f"⚡ *Active Streak:* `{stats['current_streak']} Days`\n\n"
        f"🏆 *Top Personal Records:*\n{pr_str}\n"
        f"──────────────────────────\n"
        f"✨ *AURA\\.FIT Spatial System*"
    )
    await msg_obj.reply_text(msg, parse_mode="MarkdownV2")

async def routine_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    msg_obj = update.effective_message
    if not msg_obj:
        return
    user_id = str(update.effective_user.id) if update.effective_user else str(update.effective_chat.id if update.effective_chat else "unknown")
    routine = await supabase_service.get_today_routine(user_id)

    ex_lines = []
    for ex in routine.get("exercises", []):
        target_val = ex.get('target_kg', '--')
        ex_lines.append(
            f"🏋️ *{escape_markdown(ex['name'])}*\n"
            f"   └ `{ex['sets']} Sets` x `{escape_markdown(str(ex['reps']))} Reps` \\| `{escape_markdown(str(target_val))}`"
        )
    ex_str = "\n\n".join(ex_lines)

    day_header = f" : {escape_markdown(routine['day_name'])}" if "day_name" in routine else ""
    msg = (
        f"📋 *{escape_markdown(routine['routine_name'])}{day_header}*\n"
        f"──────────────────────────\n\n"
        f"{ex_str}\n\n"
        f"──────────────────────────\n"
        f"💪 *Push past your limits today\\!*"
    )
    await msg_obj.reply_text(msg, parse_mode="MarkdownV2")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    msg_obj = update.effective_message
    if not msg_obj:
        return
    msg = (
        f"⚡ *AURA\\.FIT TELEGRAM BOT HELP*\n\n"
        f"• `/stats` \\- View volume, streak, and PRs\n"
        f"• `/routine` \\- Get today's workout plan\n"
        f"• `/help` \\- Show command menu\n\n"
        f"🔗 *Account Linking:* Register on `https://aurafitiris.vercel.app/register` to sync your workout history\\."
    )
    await msg_obj.reply_text(msg, parse_mode="MarkdownV2")

def build_telegram_app() -> Application:
    """Initialize Telegram application."""
    if not config.TELEGRAM_TOKEN:
        logger.warning("⚠️ TELEGRAM_TOKEN not provided. Telegram bot will be disabled.")
        return None

    app = Application.builder().token(config.TELEGRAM_TOKEN).build()

    # Schedule daily routine notification
    if config.DEFAULT_TELEGRAM_CHAT_ID:
        t = datetime.time(hour=7, minute=0, second=0) # 7:00 AM everyday
        app.job_queue.run_daily(send_daily_routine_notification, time=t)
        # Also run once 10 seconds after startup for testing/immediate notification
        app.job_queue.run_once(send_daily_routine_notification, 10)
        logger.info("✅ Scheduled daily routine notification job")

    # Support Commands in Private chats, Groups, AND Channels
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("stats", stats_command))
    app.add_handler(CommandHandler("routine", routine_command))
    app.add_handler(CommandHandler("help", help_command))

    return app

async def send_telegram_notification(app: Application, chat_id: str, text: str):
    """Utility to push Telegram notifications from FastAPI webhook payloads."""
    if not app:
        return False, "Bot Telegram chưa được khởi tạo"
    try:
        await app.bot.send_message(chat_id=chat_id, text=escape_markdown(text), parse_mode="MarkdownV2")
        return True, None
    except Exception as e:
        logger.warning(f"MarkdownV2 notification failed for {chat_id} ({e}), retrying plain text...")
        try:
            await app.bot.send_message(chat_id=chat_id, text=text)
            return True, None
        except Exception as e2:
            err_msg = str(e2)
            return False, err_msg

async def send_daily_routine_notification(context: ContextTypes.DEFAULT_TYPE):
    """Job to send daily routine to the default channel or user."""
    chat_id = config.DEFAULT_TELEGRAM_CHAT_ID
    if not chat_id:
        return

    logger.info(f"Running auto notification for daily routine to {chat_id}")
    routine = await supabase_service.get_today_routine("unknown")

    ex_lines = []
    for ex in routine.get("exercises", []):
        target_val = ex.get('target_kg', '--')
        ex_lines.append(
            f"🏋️ *{escape_markdown(ex['name'])}*\n"
            f"   └ `{ex['sets']} Sets` x `{escape_markdown(str(ex['reps']))} Reps` \\| `{escape_markdown(str(target_val))}`"
        )
    ex_str = "\n\n".join(ex_lines)

    day_header = f" : {escape_markdown(routine['day_name'])}" if "day_name" in routine else ""
    msg = (
        f"🌟 *LỊCH TẬP HÔM NAY CỦA BẠN*\n"
        f"📋 *{escape_markdown(routine['routine_name'])}{day_header}*\n"
        f"──────────────────────────\n\n"
        f"{ex_str}\n\n"
        f"──────────────────────────\n"
        f"💪 *Hãy xách đồ lên và đi tập ngay!*"
    )

    try:
        await context.bot.send_message(chat_id=chat_id, text=msg, parse_mode="MarkdownV2")
    except Exception as e:
        logger.error(f"Failed to auto-send daily routine: {e}")
