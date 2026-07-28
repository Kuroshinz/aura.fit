const fs = require('fs');
let c = fs.readFileSync('d:/Nexus/src/app/(dashboard)/workout/page.tsx', 'utf8');

// Replace the Restart button logic in workout/page.tsx to clean history and sync to cloud
c = c.replace(
  `onClick={() => {
                const rId = lastCompletedWorkout.routine_id
                const rName = lastCompletedWorkout.routine_name
                const exercises = lastCompletedWorkout.exercises
                
                dismissSummary()
                startWorkout(rId, rName)`,
  `onClick={() => {
                const rId = lastCompletedWorkout.routine_id
                const rName = lastCompletedWorkout.routine_name
                const exercises = lastCompletedWorkout.exercises
                
                // Clean the finished session from history to prevent duplicate entries
                const cleanHistory = useWorkoutStore.getState().workoutHistory.filter(w => w.id !== lastCompletedWorkout.id)
                useWorkoutStore.setState({ workoutHistory: cleanHistory })
                const { syncStateToCloud } = require('@/lib/supabase/user-sync')
                syncStateToCloud({ workout_history: cleanHistory }, true)
                
                dismissSummary()
                startWorkout(rId, rName)`
);

fs.writeFileSync('d:/Nexus/src/app/(dashboard)/workout/page.tsx', c, 'utf8');
console.log('Workout page updated.');
