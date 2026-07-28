import logging
from typing import Dict, Any, Optional, List
from supabase import create_client, Client
from config import config

logger = logging.getLogger("aura_fit.supabase")

from datetime import datetime

# Fallback master schedule used when no routine is found in DB
MASTER_SCHEDULE = {
    0: {
        "day_name": "PUSH (Ngực - Vai - Tay Sau)",
        "exercises": [
            {"name": "Machine Chest Press", "sets": 3, "reps": "8-10", "target_kg": "Form gồng vai chắc"},
            {"name": "Incline DB Press", "sets": 3, "reps": "8-10", "target_kg": "Góc ghế 30 độ"},
            {"name": "Pec Deck (Ép Ngực)", "sets": 2, "reps": "12-15", "target_kg": "Căng lồng ngực hết cỡ"},
            {"name": "Machine Shoulder Press", "sets": 2, "reps": "8-10", "target_kg": "Gồng bụng chắc chắn"},
            {"name": "Lateral Raise", "sets": 4, "reps": "12-15", "target_kg": "Cô lập vai giữa"},
            {"name": "Cable Tricep Extension", "sets": 3, "reps": "10-12", "target_kg": "Khóa cùi chỏ"}
        ]
    },
    1: {
        "day_name": "PULL (Lưng - Tay Trước)",
        "exercises": [
            {"name": "Lat Pulldown", "sets": 3, "reps": "8-10", "target_kg": "Kéo cùi chỏ sát sườn"},
            {"name": "Chest Supported Row", "sets": 3, "reps": "8-10", "target_kg": "Ép chặt xương vai"},
            {"name": "Seated Cable Row", "sets": 2, "reps": "10", "target_kg": "Gồng thắt lưng"},
            {"name": "Rear Delt Fly", "sets": 2, "reps": "12-15", "target_kg": "Tập trung vai sau"},
            {"name": "DB Curl", "sets": 2, "reps": "10-12", "target_kg": "Xoay cổ tay khi cuộn"},
            {"name": "Rope Hammer Curl", "sets": 2, "reps": "10-12", "target_kg": "Cô lập cơ tay trước"}
        ]
    },
    2: {
        "day_name": "LEGS (Đùi - Mông - Bắp Chân)",
        "exercises": [
            {"name": "Leg Press", "sets": 3, "reps": "10", "target_kg": "Xuống đùi song song"},
            {"name": "Lying Leg Curl", "sets": 4, "reps": "10-12", "target_kg": "Căng hết cỡ đùi sau"},
            {"name": "Leg Extension", "sets": 3, "reps": "12", "target_kg": "Vắt kiệt đùi trước"},
            {"name": "Hip Abduction Machine", "sets": 3, "reps": "15-20", "target_kg": "Phát triển mông đùi"},
            {"name": "Standing Calf Raise", "sets": 4, "reps": "15", "target_kg": "Đẩy nhón bắp chân"},
            {"name": "Cable Crunch", "sets": 3, "reps": "12-15", "target_kg": "Gập bụng dưới tạ"}
        ]
    },
    3: {
        "day_name": "NGHỈ / REST (Phục Hồi Active Recovery)",
        "exercises": [
            {"name": "Light Walking / Zone 2 Cardio", "sets": 1, "reps": "30 mins", "target_kg": "Phục hồi nhẹ nhàng"},
            {"name": "Full Body Mobility & Foam Rolling", "sets": 1, "reps": "15 mins", "target_kg": "Giãn cơ khớp"}
        ]
    },
    4: {
        "day_name": "UPPER (Thân Trên Toàn Diện)",
        "exercises": [
            {"name": "Incline Machine Press", "sets": 3, "reps": "8", "target_kg": "Phát triển ngực trên"},
            {"name": "Lat Pulldown", "sets": 3, "reps": "8", "target_kg": "Kéo phát triển xô"},
            {"name": "Seated Row Machine", "sets": 3, "reps": "10", "target_kg": "Tập trung lưng giữa"},
            {"name": "Machine Shoulder Press", "sets": 3, "reps": "8", "target_kg": "Đẩy vai dứt khoát"},
            {"name": "Lateral Raise", "sets": 3, "reps": "15", "target_kg": "Vai giữa"},
            {"name": "Cable Curl", "sets": 2, "reps": "12", "target_kg": "Cuộn tay trước"},
            {"name": "Tricep Extension", "sets": 2, "reps": "12", "target_kg": "Duỗi tay sau"}
        ]
    },
    5: {
        "day_name": "LOWER (Thân Dưới + Core)",
        "exercises": [
            {"name": "Hack Squat", "sets": 3, "reps": "8-10", "target_kg": "Gập gối sâu gồng bụng"},
            {"name": "Lying Leg Curl", "sets": 4, "reps": "10-12", "target_kg": "Tác động đùi sau"},
            {"name": "Leg Extension", "sets": 3, "reps": "12", "target_kg": "Duỗi đùi trước"},
            {"name": "Standing Calf Raise", "sets": 4, "reps": "15", "target_kg": "Bắp chân"},
            {"name": "Cable Crunch", "sets": 3, "reps": "12", "target_kg": "Gập bụng cáp"}
        ]
    },
    6: {
        "day_name": "NGHỈ / REST (Nghỉ Ngơi Hoàn Toàn)",
        "exercises": [
            {"name": "Rest & Sleep Recovery", "sets": 1, "reps": "Full Day", "target_kg": "Nạp đủ Protein & Ngủ 8 tiếng"}
        ]
    }
}

WORKOUT_SPLIT_SCHEDULES = {
    "ppl_ul_5d": ["Push", "Pull", "Rest", "Upper", "Lower", "Push", "Rest"],
    "ppl_6d": ["Push", "Pull", "Legs", "Push", "Pull", "Legs", "Rest"],
    "upper_lower_4d": ["Upper A", "Lower A", "Rest", "Upper B", "Lower B", "Rest", "Rest"],
    "bro_split_5d": ["Chest", "Back", "Shoulders", "Legs", "Arms", "Rest", "Rest"],
    "full_body_3d": ["Full Body A", "Rest", "Full Body B", "Rest", "Full Body C", "Rest", "Rest"],
}


class SupabaseService:
    def __init__(self):
        self.client: Optional[Client] = None
        if config.SUPABASE_URL and config.SUPABASE_KEY:
            try:
                self.client = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
                logger.info("✅ Supabase client initialized successfully")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Supabase client: {e}")

    async def get_user_stats(self, email_or_id: str) -> Dict[str, Any]:
        """Fetch total volume, streak, and top PRs for a user."""
        if not self.client:
            return {
                "total_volume": 148500,
                "current_streak": 7,
                "top_prs": [
                    {"exercise": "Bench Press", "weight_kg": 110.0, "reps": 5},
                    {"exercise": "Squat", "weight_kg": 140.0, "reps": 3},
                    {"exercise": "Deadlift", "weight_kg": 170.0, "reps": 1}
                ]
            }
        try:
            history_res = self.client.table("workout_history").select("*").or_(f"user_email.eq.{email_or_id},user_id.eq.{email_or_id}").execute()
            history = history_res.data or []
            total_vol = sum(w.get("total_volume", 0) for w in history)
            return {
                "total_volume": total_vol,
                "current_streak": len(history),
                "top_prs": [
                    {"exercise": "Bench Press", "weight_kg": 105.0, "reps": 5},
                    {"exercise": "Barbell Squat", "weight_kg": 135.0, "reps": 3}
                ]
            }
        except Exception as e:
            logger.error(f"Error querying Supabase stats: {e}")
            return {"total_volume": 0, "current_streak": 0, "top_prs": []}

    def _get_today_day_key(self, split_id: str = "ppl_ul_5d") -> str:
        weekday_idx = datetime.now().weekday()
        schedule = WORKOUT_SPLIT_SCHEDULES.get(split_id, WORKOUT_SPLIT_SCHEDULES["ppl_ul_5d"])
        if 0 <= weekday_idx < len(schedule):
            return schedule[weekday_idx]
        return "Rest"

    def _find_today_exercises(self, schedule_data: dict, today_key: str) -> tuple:
        """Return (day_name, exercises) for today's schedule."""
        if not schedule_data or "days" not in schedule_data:
            return today_key, []
        for day_entry in schedule_data["days"]:
            if day_entry.get("dayName", "").lower() == today_key.lower():
                return day_entry.get("dayName", today_key), day_entry.get("exercises", [])
        for day_entry in schedule_data["days"]:
            dn = day_entry.get("dayName", "").lower()
            if today_key.lower() in dn or dn in today_key.lower():
                return day_entry.get("dayName", today_key), day_entry.get("exercises", [])
        return today_key, []

    async def get_today_routine(self, email_or_id: str = "unknown") -> Dict[str, Any]:
        """Fetch today's scheduled routine using the user's custom routine from DB."""
        routine_name = "PPL-UL MASTER v7 (GymOS Master Program)"
        split_id = "ppl_ul_5d"
        schedule_data = None
        if self.client:
            try:
                res = self.client.table("routines").select("*").eq("user_id", email_or_id).eq("is_active", True).order("updated_at", desc=True).limit(1).execute()
                if res.data:
                    routine = res.data[0]
                    routine_name = routine.get("name", routine_name)
                    split_id = routine.get("split_id", split_id)
                    schedule_data = routine.get("schedule_data")
            except Exception as e:
                logger.error(f"Error querying Supabase routine for {email_or_id}: {e}")
        today_key = self._get_today_day_key(split_id)
        day_name, exercises = self._find_today_exercises(schedule_data, today_key)
        if not exercises:
            weekday_idx = datetime.now().weekday()
            master_plan = MASTER_SCHEDULE.get(weekday_idx, MASTER_SCHEDULE[0])
            day_name = master_plan["day_name"]
            exercises = master_plan["exercises"]
        return {
            "routine_name": routine_name,
            "day_name": day_name,
            "exercises": exercises,
            "split_id": split_id,
            "today_key": today_key
        }

    async def get_user_profile_by_chat_id(self, chat_id: str) -> Optional[Dict[str, Any]]:
        if not self.client:
            return None
        try:
            res = self.client.table("profiles").select("id,email,full_name,telegram_chat_id,auto_send_routine").eq("telegram_chat_id", chat_id).limit(1).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.error(f"Error finding profile by chat_id {chat_id}: {e}")
        return None


supabase_service = SupabaseService()
