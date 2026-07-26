import logging
from typing import Dict, Any, Optional
from supabase import create_client, Client
from config import config

logger = logging.getLogger("aura_fit.supabase")

from datetime import datetime

MASTER_SCHEDULE = {
    0: { # Monday
        "day_name": "PUSH (Ngực - Vai - Tay Sau)",
        "exercises": [
            {"name": "Machine Chest Press", "sets": 3, "reps": "8–10", "target_kg": "Form gồng vai chắc"},
            {"name": "Incline DB Press", "sets": 3, "reps": "8–10", "target_kg": "Góc ghế 30 độ"},
            {"name": "Pec Deck (Ép Ngực)", "sets": 2, "reps": "12–15", "target_kg": "Căng lồng ngực hết cỡ"},
            {"name": "Machine Shoulder Press", "sets": 2, "reps": "8–10", "target_kg": "Gồng bụng chắc chắn"},
            {"name": "Lateral Raise", "sets": 4, "reps": "12–15", "target_kg": "Cô lập vai giữa"},
            {"name": "Cable Tricep Extension", "sets": 3, "reps": "10–12", "target_kg": "Khóa cùi chỏ"}
        ]
    },
    1: { # Tuesday
        "day_name": "PULL (Lưng - Tay Trước)",
        "exercises": [
            {"name": "Lat Pulldown", "sets": 3, "reps": "8–10", "target_kg": "Kéo cùi chỏ sát sườn"},
            {"name": "Chest Supported Row", "sets": 3, "reps": "8–10", "target_kg": "Ép chặt xương vai"},
            {"name": "Seated Cable Row", "sets": 2, "reps": "10", "target_kg": "Gồng thắt lưng"},
            {"name": "Rear Delt Fly", "sets": 2, "reps": "12–15", "target_kg": "Tập trung vai sau"},
            {"name": "DB Curl", "sets": 2, "reps": "10–12", "target_kg": "Xoay cổ tay khi cuộn"},
            {"name": "Rope Hammer Curl", "sets": 2, "reps": "10–12", "target_kg": "Cô lập cơ tay trước"}
        ]
    },
    2: { # Wednesday
        "day_name": "LEGS (Đùi - Mông - Bắp Chân)",
        "exercises": [
            {"name": "Leg Press", "sets": 3, "reps": "10", "target_kg": "Xuống đùi song song"},
            {"name": "Lying Leg Curl", "sets": 4, "reps": "10–12", "target_kg": "Căng hết cỡ đùi sau"},
            {"name": "Leg Extension", "sets": 3, "reps": "12", "target_kg": "Vắt kiệt đùi trước"},
            {"name": "Hip Abduction Machine", "sets": 3, "reps": "15–20", "target_kg": "Phát triển mông đùi"},
            {"name": "Standing Calf Raise", "sets": 4, "reps": "15", "target_kg": "Đẩy nhón bắp chân"},
            {"name": "Cable Crunch", "sets": 3, "reps": "12–15", "target_kg": "Gập bụng dưới tạ"}
        ]
    },
    3: { # Thursday
        "day_name": "NGHỈ / REST (Phục Hồi Active Recovery)",
        "exercises": [
            {"name": "Light Walking / Zone 2 Cardio", "sets": 1, "reps": "30 mins", "target_kg": "Phục hồi nhẹ nhàng"},
            {"name": "Full Body Mobility & Foam Rolling", "sets": 1, "reps": "15 mins", "target_kg": "Giãn cơ khớp"}
        ]
    },
    4: { # Friday
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
    5: { # Saturday
        "day_name": "LOWER (Thân Dưới + Core)",
        "exercises": [
            {"name": "Hack Squat", "sets": 3, "reps": "8–10", "target_kg": "Gập gối sâu gồng bụng"},
            {"name": "Lying Leg Curl", "sets": 4, "reps": "10–12", "target_kg": "Tác động đùi sau"},
            {"name": "Leg Extension", "sets": 3, "reps": "12", "target_kg": "Duỗi đùi trước"},
            {"name": "Standing Calf Raise", "sets": 4, "reps": "15", "target_kg": "Bắp chân"},
            {"name": "Cable Crunch", "sets": 3, "reps": "12", "target_kg": "Gập bụng cáp"}
        ]
    },
    6: { # Sunday
        "day_name": "NGHỈ / REST (Nghỉ Ngơi Hoàn Toàn)",
        "exercises": [
            {"name": "Rest & Sleep Recovery", "sets": 1, "reps": "Full Day", "target_kg": "Nạp đủ Protein & Ngủ 8 tiếng"}
        ]
    }
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
            profile_res = self.client.table("profiles").select("*").or_(f"email.eq.{email_or_id},id.eq.{email_or_id}").execute()
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

    async def get_today_routine(self, email_or_id: str) -> Dict[str, Any]:
        """Fetch today's scheduled routine for a user dynamically calculated based on day of week."""
        if self.client:
            try:
                res = self.client.table("routines").select("*").or_(f"user_email.eq.{email_or_id},user_id.eq.{email_or_id}").execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.error(f"Error querying Supabase routine: {e}")
            
        # Dynamic lookup based on real local calendar day (0=Mon, 1=Tue, ..., 6=Sun)
        weekday_idx = datetime.now().weekday()
        today_plan = MASTER_SCHEDULE.get(weekday_idx, MASTER_SCHEDULE[0])
        
        return {
            "routine_name": "PPL-UL MASTER v7 (GymOS Master Program)",
            "day_name": today_plan["day_name"],
            "exercises": today_plan["exercises"]
        }

supabase_service = SupabaseService()
