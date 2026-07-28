import logging
import re
import datetime
from typing import Optional
from telegram import Update, Chat
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
    chat_id = str(update.effective_chat.id if update.effective_chat else "unknown")
    
    msg = (
        f"👑 *Welcome to AURA\\.FIT, {escape_markdown(user_name)}\\!*\n\n"
        f"Your personal AI Athletic Companion on Telegram\\.\n\n"
        f"Your Chat ID: `{chat_id}`\n\n"
        f"• `/stats` \\- View total volume, streak \\& PRs\n"
        f"• `/routine` \\- Today's workout plan\n"
        f"• `/help` \\- Account linking \\& support\n"
    )
    await msg_obj.reply_text(msg, parse_mode="MarkdownV2")

async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    msg_obj = update.effective_message
    if not msg_obj:
        return
    chat_id = str(update.effective_chat.id) if update.effective_chat else "unknown"
    # Look up Supabase user by their telegram_chat_id
    user_profile = await supabase_service.get_user_profile_by_chat_id(chat_id)
    user_id = user_profile.get("id") if user_profile else chat_id
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
    chat_id = str(update.effective_chat.id) if update.effective_chat else "unknown"
    # Look up Supabase user by their telegram_chat_id to get their real routine
    user_profile = await supabase_service.get_user_profile_by_chat_id(chat_id)
    user_id = user_profile.get("id") if user_profile else "unknown"
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

async def myid_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Reply with the user's Chat ID for them to use in the profile setup."""
    msg_obj = update.effective_message
    if not msg_obj:
        return
    chat_id = str(update.effective_chat.id) if update.effective_chat else "unknown"
    user_name = update.effective_user.first_name if update.effective_user else "Athlete"
    username = update.effective_user.username if update.effective_user else None
    
    msg_lines = [
        f"👤 *Your Telegram Info, {escape_markdown(user_name)}*",
        f"──────────────────────────",
        f"🆔 *Chat ID:* `{chat_id}`"
    ]
    if username:
        msg_lines.append(f"📛 *Username:* @{escape_markdown(username)}")
    msg_lines.append(f"")
    msg_lines.append(f"ℹ️ Use this Chat ID in your AURA\\.FIT Profile settings to receive notifications\\!")
    msg_lines.append(f"──────────────────────────")
    
    msg = "\n".join(msg_lines)
    await msg_obj.reply_text(msg, parse_mode="MarkdownV2")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    msg_obj = update.effective_message
    if not msg_obj:
        return
    msg = (
        f"⚡ *AURA\\.FIT TELEGRAM BOT HELP*\n\n"
        f"• `/stats` \\- View volume, streak, and PRs\n"
        f"• `/routine` \\- Get today's workout plan\n"
        f"• `/myid` \\- Get your Telegram Chat ID\n"
        f"• `/help` \\- Show command menu\n\n"
        f"🔗 *Account Linking:*\n"
        f"1\\. Get your `Chat ID` using `/myid`\n"
        f"2\\. Go to AURA\\.FIT Profile → Telegram section\n"
        f"3\\. Paste your Chat ID and enable auto\\-send\n"
        f"4\\. You'll receive daily workouts at 7:00 AM\\!"
    )
    await msg_obj.reply_text(msg, parse_mode="MarkdownV2")

def build_telegram_app() -> Application:
    """Initialize Telegram application."""
    if not config.TELEGRAM_TOKEN:
        logger.warning("⚠️ TELEGRAM_TOKEN not provided. Telegram bot will be disabled.")
        return None

    app = Application.builder().token(config.TELEGRAM_TOKEN).build()

    # Schedule daily routine notification at 7:00 AM for DEFAULT chat
    if config.DEFAULT_TELEGRAM_CHAT_ID:
        t = datetime.time(hour=7, minute=0, second=0)
        app.job_queue.run_daily(send_daily_routine_notification, time=t)
        # Also schedule per-user notifications every 5 minutes between 7-8 AM
        app.job_queue.run_repeating(check_and_send_user_notifications, interval=300, first=10)
        logger.info("✅ Scheduled daily routine notification jobs")

    # Support Commands
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("stats", stats_command))
    app.add_handler(CommandHandler("routine", routine_command))
    app.add_handler(CommandHandler("myid", myid_command))
    app.add_handler(CommandHandler("help", help_command))

    return app

async def send_telegram_notification(app: Application, chat_id: str, text: str):
    """Utility to push Telegram notifications."""
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
            return False, str(e2)

def _build_routine_message(routine: dict) -> str:
    """Build a formatted workout message from routine data."""
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
        f"💪 *Hãy xách đồ lên và đi tập ngay\\!*"
    )
    return msg

async def send_daily_routine_notification(context: ContextTypes.DEFAULT_TYPE):
    """Send daily routine to the default configured chat."""
    chat_id = config.DEFAULT_TELEGRAM_CHAT_ID
    if not chat_id:
        return
    logger.info(f"Running auto notification for daily routine to default chat {chat_id}")
    routine = await supabase_service.get_today_routine("unknown")
    msg = _build_routine_message(routine)
    try:
        await context.bot.send_message(chat_id=chat_id, text=msg, parse_mode="MarkdownV2")
    except Exception as e:
        logger.error(f"Failed to auto-send daily routine to default chat: {e}")

async def check_and_send_user_notifications(context: ContextTypes.DEFAULT_TYPE):
    """
    Periodic job: query all user profiles with auto_send_routine=true
    and send them their personalized daily workout.
    Runs every 5 minutes, but each user only receives once per day.
    """
    logger.info("Checking users for auto routine notifications...")
    
    if not supabase_service.client:
        logger.warning("Supabase client not available, skipping per-user notifications")
        return
    
    # Query profiles that have auto_send_routine enabled and a telegram_chat_id
    try:
        res = supabase_service.client.table("profiles") \
            .select("id,email,full_name,telegram_chat_id") \
            .eq("auto_send_routine", True) \
            .not_.is_("telegram_chat_id", "null") \
            .execute()
    except Exception as e:
        logger.error(f"Error querying profiles for notifications: {e}")
        return
    
    profiles = res.data or []
    today_str = datetime.datetime.now().strftime("%Y-%m-%d")
    
    for profile in profiles:
        chat_id = profile.get("telegram_chat_id", "").strip()
        if not chat_id:
            continue
        
        # Check if we already sent today (stored in a simple in-memory set)
        sent_key = f"sent_{chat_id}_{today_str}"
        if hasattr(context.bot_data, sent_key) or sent_key in context.bot_data:
            continue
        
        # DEDUP STORAGE: use a Supabase flag or simple bot_data dict
        already_sent = context.bot_data.get(sent_key, False)
        if already_sent:
            continue
        
        user_id = profile.get("id", "unknown")
        routine = await supabase_service.get_today_routine(user_id)
        msg = _build_routine_message(routine)
        
        try:
            await context.bot.send_message(chat_id=chat_id, text=msg, parse_mode="MarkdownV2")
            context.bot_data[sent_key] = True
            logger.info(f"✅ Sent daily routine to {profile.get('email', chat_id)} (chat: {chat_id})")
        except Exception as e:
            logger.error(f"Failed to send to {chat_id}: {e}")
