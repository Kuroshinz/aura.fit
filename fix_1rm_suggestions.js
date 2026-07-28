const fs = require('fs');
let c = fs.readFileSync('d:/Nexus/src/components/workout/exercise-log-card.tsx', 'utf8');

const oldOverload = `{/* Overload Metrics */}
              {current1RM > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-wrap gap-4 text-[11px] font-mono text-slate-300">
                  <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-cyan-400" /> Tăng chuẩn: <strong className="text-white">{(modalWeight + 2.5).toFixed(1)} kg</strong></div>
                  <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emerald-400" /> Overload 5%: <strong className="text-white">{(modalWeight * 1.05).toFixed(1)} kg</strong></div>
                </div>
              )}`;

const newOverload = `{/* Overload Metrics */}
              {current1RM > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-col gap-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">TIẾP THEO BẠN CÓ THỂ THỬ:</span>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => {
                        addSet(exerciseId)
                        setTimeout(() => {
                          const ex = useWorkoutStore.getState().activeWorkout?.exercises.find(e => e.exercise_id === exerciseId)
                          if (ex) {
                            const lastSet = ex.sets[ex.sets.length - 1]
                            updateSet(exerciseId, lastSet.id, 'weight_kg', parseFloat((modalWeight + 2.5).toFixed(1)))
                            updateSet(exerciseId, lastSet.id, 'reps', modalReps)
                          }
                        }, 50)
                      }}
                      className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl font-mono text-xs flex items-center gap-2 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5" /> Tăng chuẩn (+2.5kg): <strong className="text-white">{(modalWeight + 2.5).toFixed(1)} kg</strong>
                    </button>
                    
                    <button 
                      onClick={() => {
                        addSet(exerciseId)
                        setTimeout(() => {
                          const ex = useWorkoutStore.getState().activeWorkout?.exercises.find(e => e.exercise_id === exerciseId)
                          if (ex) {
                            const lastSet = ex.sets[ex.sets.length - 1]
                            updateSet(exerciseId, lastSet.id, 'weight_kg', parseFloat((modalWeight * 1.05).toFixed(1)))
                            updateSet(exerciseId, lastSet.id, 'reps', modalReps)
                          }
                        }, 50)
                      }}
                      className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl font-mono text-xs flex items-center gap-2 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5" /> Overload (+5%): <strong className="text-white">{(modalWeight * 1.05).toFixed(1)} kg</strong>
                    </button>
                  </div>
                </div>
              )}`;

c = c.replace(oldOverload, newOverload);
fs.writeFileSync('d:/Nexus/src/components/workout/exercise-log-card.tsx', c, 'utf8');
console.log('Exercise log card updated');
