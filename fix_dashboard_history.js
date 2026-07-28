const fs = require('fs');
let c = fs.readFileSync('d:/Nexus/src/app/(dashboard)/dashboard/page.tsx', 'utf8');

// Add ChevronUp/ChevronDown and AnimatePresence imports
c = c.replace(
  "import { Dumbbell, Flame, Trophy, Calendar, Sparkles, TrendingUp, Star, Clock, StickyNote, Download, Send, CheckCircle, AlertCircle } from 'lucide-react'",
  "import { Dumbbell, Flame, Trophy, Calendar, Sparkles, TrendingUp, Star, Clock, StickyNote, Download, Send, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'\nimport { AnimatePresence } from 'framer-motion'"
);

// Add expandedHistoryIds state
c = c.replace(
  "const [telegramToast, setTelegramToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)",
  "const [telegramToast, setTelegramToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)\n  const [expandedHistoryIds, setExpandedHistoryIds] = useState<string[]>([]);\n\n  const toggleHistoryExpand = (id: string) => {\n    setExpandedHistoryIds((prev) =>\n      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]\n    )\n  }"
);

// Completely replace the old grid rendering with the new collapsible rendering
const oldGridRegex = /\{\/\* Workout Exercises Detail \*\/\}[\s\S]*?<\/div>\s*<\/motion\.div>/g;

const newGridCode = `{/* Workout Exercises Detail */}
                  <div className="flex justify-center mt-2">
                    <button onClick={() => toggleHistoryExpand(w.id)} className="px-6 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-full text-xs font-mono font-bold text-amber-400 flex items-center gap-2 transition-all">
                      {expandedHistoryIds.includes(w.id) ? (
                        <><ChevronUp className="w-4 h-4" /> ẨN CHI TIẾT BÀI TẬP</>
                      ) : (
                        <><ChevronDown className="w-4 h-4" /> XEM CHI TIẾT BÀI TẬP</>
                      )}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {expandedHistoryIds.includes(w.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-slate-800 pt-6 mt-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {w.exercises.map((ex, eIdx) => (
                            <div key={eIdx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-full uppercase text-amber-400">
                                {ex.muscle_group}
                              </span>
                              <h4 className="font-bold text-white text-base mt-2 mb-1">{ex.exercise_name}</h4>
                              <div className="space-y-1">
                                {ex.sets.map((set, sIdx) => (
                                  <div key={set.id} className="flex justify-between text-xs text-slate-400 font-mono">
                                    <span>Set {sIdx + 1}: {set.weight_kg}kg x {set.reps} reps</span>
                                    {set.is_completed && <span className="text-emerald-400 font-bold">✓ Hoàn thành</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>`;

c = c.replace(oldGridRegex, newGridCode);

fs.writeFileSync('d:/Nexus/src/app/(dashboard)/dashboard/page.tsx', c, 'utf8');
console.log('Dashboard updated');
