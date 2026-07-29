-- Add Telegram notification fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS auto_send_routine BOOLEAN DEFAULT true;
