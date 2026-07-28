const fs = require('fs');
let c = fs.readFileSync('d:/Nexus/src/app/(dashboard)/workout/page.tsx', 'utf8');

// 1. Add imports
if (!c.includes('import { useToastStore }')) {
  c = c.replace(
    "import { Dumbbell, Play, CheckCircle2, Plus, Flame, Sparkles, Activity, Search, X, Clock, Trophy, Zap, ArrowRight } from 'lucide-react'",
    "import { Dumbbell, Play, CheckCircle2, Plus, Flame, Sparkles, Activity, Search, X, Clock, Trophy, Zap, ArrowRight, RefreshCw } from 'lucide-react'\nimport { useToastStore } from '@/components/effects/toast'"
  );
}

// 2. Modify summary screen to include Restart button
const originalButton = `<button
            onClick={dismissSummary}
            className="w-full py-4 btn-aura-gold text-black font-display font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-2xl"
          >
            VỀ TRANG CHỦ
            <ArrowRight className="w-5 h-5" />
          </button>`;

const newButtons = `<div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => {
                const rId = lastCompletedWorkout.routine_id
                const rName = lastCompletedWorkout.routine_name
                const exercises = lastCompletedWorkout.exercises
                
                dismissSummary()
                startWorkout(rId, rName)
                
                // Add the exercises back immediately
                exercises.forEach((ex) => {
                  addExerciseToWorkout(ex.exercise_id, ex.exercise_name, ex.muscle_group)
                })
              }}
              className="flex-1 py-4 bg-slate-900 border border-slate-700 hover:border-amber-400 text-amber-400 font-display font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4 animate-spin-hover" />
              TẬP LẠI (RESTART)
            </button>
            <button
              onClick={dismissSummary}
              className="flex-1 py-4 btn-aura-gold text-black font-display font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-2xl"
            >
              VỀ TRANG CHỦ
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>`;

c = c.replace(originalButton, newButtons);

// 3. Add toast trigger on finishWorkout
c = c.replace(
  'finishWorkout()',
  `finishWorkout()
              
              useToastStore.getState().addToast({
                variant: 'success',
                title: 'Hoàn thành buổi tập!',
                message: \`Chúc mừng bạn đã hoàn thành xuất sắc buổi tập '\${routineName}' ngày hôm nay!\`
              })`
);

fs.writeFileSync('d:/Nexus/src/app/(dashboard)/workout/page.tsx', c, 'utf8');
console.log('Workout page updated successfully.');
