import { createClient } from './client';

/**
 * Reset all user-owned data in Supabase while preserving the auth account.
 * Deletes: set_logs, workout_logs, routines (non-global), routine_exercises
 * Resets: profiles row to defaults
 */
export async function resetAllUserData(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    // 1. Fetch the user's workout log ids
    const { data: workoutLogs } = await supabase
      .from('workout_logs')
      .select('id')
      .eq('user_id', userId);

    if (workoutLogs && workoutLogs.length > 0) {
      const logIds = workoutLogs.map((l) => l.id);

      // 2. Delete set_logs linked to those workout logs
      const { error: setLogsError } = await supabase
        .from('set_logs')
        .delete()
        .in('workout_log_id', logIds);
      if (setLogsError) throw setLogsError;

      // 3. Delete the workout logs
      const { error: workoutLogsError } = await supabase
        .from('workout_logs')
        .delete()
        .in('id', logIds);
      if (workoutLogsError) throw workoutLogsError;
    }

    // 4. Fetch user's personal routine ids (exclude global templates)
    const { data: routines } = await supabase
      .from('routines')
      .select('id')
      .eq('user_id', userId)
      .eq('is_global_template', false);

    if (routines && routines.length > 0) {
      const routineIds = routines.map((r) => r.id);

      // 5. Delete routine_exercises linked to those routines
      const { error: routineExError } = await supabase
        .from('routine_exercises')
        .delete()
        .in('routine_id', routineIds);
      if (routineExError) throw routineExError;

      // 6. Delete the routines
      const { error: routinesError } = await supabase
        .from('routines')
        .delete()
        .in('id', routineIds);
      if (routinesError) throw routinesError;
    }

    // 7. Reset the profile to defaults
    const { error: profileResetError } = await supabase
      .from('profiles')
      .update({
        age: null,
        gender: null,
        height_cm: null,
        weight_kg: null,
        body_fat: null,
        experience: null,
        goal: null,
        sessions_per_week: null,
        workout_history: null,
        personal_records: null,
        active_workout: null,
        exercise_state: null,
        metrics_history: null,
        telegram_chat_id: null,
        auto_send_routine: null,
      })
      .eq('id', userId);
    if (profileResetError) throw profileResetError;

    return { success: true };
  } catch (e: any) {
    console.error('❌ resetAllUserData error:', e);
    return { success: false, error: e.message || 'Unknown error' };
  }
}
