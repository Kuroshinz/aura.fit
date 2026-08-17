# Telegram Bot Optimization & Expansion Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the AURA.FIT Telegram bot by introducing interactive inline keyboards (buttons), deep-linking to the web app, handling button callbacks, and optimizing error handling for a premium UX.

**Architecture:** 
- The `telegram_bot.py` file will be refactored to use `InlineKeyboardMarkup` and `InlineKeyboardButton` from `telegram`.
- A new `CallbackQueryHandler` will be added to the `Application` to route button clicks seamlessly to the existing command logic (`/stats`, `/routine`, etc.) without requiring the user to type.
- The 7 AM automated daily routine will include a "Start Workout" button that deep-links directly to the web app.

**Tech Stack:** Python 3.11+, `python-telegram-bot` v20+, Supabase.

## Global Constraints

- Must retain `MarkdownV2` parsing for text, ensuring all special characters (`!`, `.`, `-`, etc.) remain correctly escaped.
- Must not break the existing webhook notification delivery system.
- Button callback data must be concise to avoid Telegram's 64-byte payload limit.

---

### Task 1: Add Interactive Inline Keyboards to Commands

**Files:**
- Modify: `python_backend/bots/telegram_bot.py`

**Interfaces:**
- Consumes: `InlineKeyboardButton`, `InlineKeyboardMarkup` from `telegram`
- Produces: Rich button menus for `/start` and `/help` commands.

- [ ] **Step 1: Import Keyboard Modules**
Modify `telegram_bot.py` imports.
```python
from telegram import Update, Chat, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
```

- [ ] **Step 2: Update Start & Help Commands with Menus**
Update the `start_command` and `help_command` functions to include a button menu.
```python
    keyboard = [
        [
            InlineKeyboardButton("📊 My Stats", callback_data="cmd_stats"),
            InlineKeyboardButton("📋 Today's Routine", callback_data="cmd_routine")
        ],
        [
            InlineKeyboardButton("🚀 Open AURA.FIT", url="https://aurafitiris.vercel.app")
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await msg_obj.reply_text(msg, parse_mode="MarkdownV2", reply_markup=reply_markup)
```
*(Apply to both `start_command` and `help_command`)*

- [ ] **Step 3: Commit**
```bash
git add python_backend/bots/telegram_bot.py
git commit -m "feat(telegram): add inline keyboard menus to start and help commands"
```

---

### Task 2: Implement Callback Query Handler for Buttons

**Files:**
- Modify: `python_backend/bots/telegram_bot.py`

**Interfaces:**
- Consumes: Button clicks (`callback_data`)
- Produces: Routed execution to `stats_command` or `routine_command`

- [ ] **Step 1: Create Callback Handler Function**
```python
async def button_callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer() # Acknowledge the button click

    # Route based on callback data
    if query.data == "cmd_stats":
        await stats_command(update, context)
    elif query.data == "cmd_routine":
        await routine_command(update, context)
```

- [ ] **Step 2: Register Callback Handler in Application**
Inside `build_telegram_app()`:
```python
    app.add_handler(CallbackQueryHandler(button_callback_handler))
```

- [ ] **Step 3: Update Command Functions to Support Callback Queries**
In `stats_command` and `routine_command`, update the `msg_obj` resolution to handle callbacks:
```python
    msg_obj = update.effective_message
    if not msg_obj:
        return
```
*(This is already correct in the current code, just verify `update.effective_chat.id` resolves correctly for queries).*

- [ ] **Step 4: Commit**
```bash
git add python_backend/bots/telegram_bot.py
git commit -m "feat(telegram): handle interactive button callbacks"
```

---

### Task 3: Add Web App Deep Linking to Daily Routine Notifications

**Files:**
- Modify: `python_backend/bots/telegram_bot.py`

**Interfaces:**
- Consumes: `_build_routine_message` and `send_telegram_notification`
- Produces: 7 AM routine notifications containing an "Open App" button.

- [ ] **Step 1: Create Global Reply Markup Helper**
```python
def get_webapp_keyboard():
    keyboard = [[InlineKeyboardButton("🔥 START WORKOUT NOW", url="https://aurafitiris.vercel.app/workout")]]
    return InlineKeyboardMarkup(keyboard)
```

- [ ] **Step 2: Attach Keyboard to Webhook and Daily Senders**
Update `send_daily_routine_notification` and `check_and_send_user_notifications`:
```python
        try:
            await context.bot.send_message(
                chat_id=chat_id, 
                text=msg, 
                parse_mode="MarkdownV2", 
                reply_markup=get_webapp_keyboard()
            )
```

- [ ] **Step 3: Commit**
```bash
git add python_backend/bots/telegram_bot.py
git commit -m "feat(telegram): add deep-link button to daily routine alerts"
```
