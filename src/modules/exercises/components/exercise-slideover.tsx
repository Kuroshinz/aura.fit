'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, Plus, GripVertical, Check, Loader2 } from 'lucide-react';
import { ExerciseRecord } from '@/repositories/exercises/exercise-repository';
import { MediaUploader } from './media-uploader';
import { createClient } from '@/lib/supabase/client';

interface ExerciseSlideoverProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Partial<ExerciseRecord> | null;
  onSave: (ex: Partial<ExerciseRecord>) => void;
  onDelete?: (id: string) => void;
}

const MUSCLES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
const EQUIPMENT = ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Kettlebell', 'Other'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

export function ExerciseSlideover({ isOpen, onClose, exercise, onSave, onDelete }: ExerciseSlideoverProps) {
  const [formData, setFormData] = React.useState<Partial<ExerciseRecord>>({});
  const [autoSaving, setAutoSaving] = React.useState(false);
  const [autoSavedAt, setAutoSavedAt] = React.useState<string | null>(null);
  const [autoSaveError, setAutoSaveError] = React.useState<string | null>(null);
  const autoSaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRender = React.useRef(true);

  React.useEffect(() => {
    if (exercise) {
      setFormData({
        ...exercise,
        instructions: exercise.instructions || [],
        media_urls: exercise.media_urls || [],
        difficulty: exercise.difficulty || 'beginner'
      });
    } else {
      setFormData({});
    }
    // Reset auto-save state khi mở slideover
    setAutoSaving(false);
    setAutoSavedAt(null);
    setAutoSaveError(null);
    firstRender.current = true;
  }, [exercise, isOpen]);

  // ==================== AUTO-SAVE (debounce 1.2s) ====================
  // Mỗi khi formData đổi và có id (đang sửa bài có sẵn) → tự lưu
  React.useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (!formData.id) return; // bài mới: chỉ lưu khi bấm nút Save
    if (!formData.name || !formData.muscle_group || !formData.equipment) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setAutoSaving(true);
    setAutoSaveError(null);

    autoSaveTimer.current = setTimeout(async () => {
      try {
        const supabase = createClient();
        const { id, created_at, ...updates } = formData;
        const { error } = await supabase.from('exercises').update(updates).eq('id', id as string);
        if (error) throw error;
        setAutoSavedAt(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (e: any) {
        setAutoSaveError(e.message || 'Lỗi lưu');
      } finally {
        setAutoSaving(false);
      }
    }, 1200);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [formData]);

  const handleSave = () => {
    if (!formData.name || !formData.muscle_group || !formData.equipment) {
      alert('Name, Muscle, and Equipment are required.');
      return;
    }
    onSave(formData);
  };

  const handleInstructionChange = (idx: number, value: string) => {
    const newInstructions = [...(formData.instructions || [])];
    newInstructions[idx] = value;
    setFormData({ ...formData, instructions: newInstructions });
  };

  const addInstruction = () => {
    setFormData({ ...formData, instructions: [...(formData.instructions || []), ''] });
  };

  const removeInstruction = (idx: number) => {
    const newInstructions = [...(formData.instructions || [])];
    newInstructions.splice(idx, 1);
    setFormData({ ...formData, instructions: newInstructions });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[500px] lg:w-[600px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950">
              <h2 className="text-xl font-bold text-white">
                {formData.id ? 'Edit Exercise' : 'Create Exercise'}
              </h2>
              <div className="flex items-center gap-3">
                {formData.id && (
                  <div className="text-[11px] font-bold flex items-center gap-1.5">
                    {autoSaving ? (
                      <span className="text-amber-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Đang lưu...</span>
                    ) : autoSaveError ? (
                      <span className="text-red-400">⚠️ {autoSaveError.slice(0, 40)}</span>
                    ) : autoSavedAt ? (
                      <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Đã lưu {autoSavedAt}</span>
                    ) : null}
                  </div>
                )}
                {formData.id && onDelete && (
                  <button onClick={() => onDelete(formData.id as string)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Basic Info */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider border-b border-slate-800 pb-2">Basic Info</h3>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Exercise Name *</label>
                  <input 
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Barbell Bench Press"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target Muscle *</label>
                    <select 
                      value={formData.muscle_group || ''} 
                      onChange={e => setFormData({ ...formData, muscle_group: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-amber-500"
                    >
                      <option value="">Select Muscle</option>
                      {MUSCLES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Equipment *</label>
                    <select 
                      value={formData.equipment || ''} 
                      onChange={e => setFormData({ ...formData, equipment: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-amber-500"
                    >
                      <option value="">Select Equipment</option>
                      {EQUIPMENT.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Difficulty</label>
                  <div className="flex gap-2">
                    {DIFFICULTIES.map(diff => (
                      <button
                        key={diff}
                        onClick={() => setFormData({ ...formData, difficulty: diff })}
                        className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg border transition-colors ${
                          formData.difficulty === diff 
                            ? diff === 'beginner' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                              : diff === 'intermediate' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                              : 'bg-red-500/20 border-red-500/50 text-red-400'
                            : 'bg-slate-950 border-slate-700 text-slate-500 hover:bg-slate-900'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Rich Details */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider border-b border-slate-800 pb-2">Details</h3>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Description</label>
                  <textarea 
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief overview of the exercise..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white outline-none resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-slate-500 uppercase">Step-by-step Instructions</label>
                    <button onClick={addInstruction} className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Step
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {(formData.instructions || []).map((inst, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="mt-2 text-slate-600"><GripVertical className="w-4 h-4 cursor-grab" /></div>
                        <div className="w-6 h-6 shrink-0 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-400 mt-1">{idx + 1}</div>
                        <textarea
                          value={inst}
                          onChange={e => handleInstructionChange(idx, e.target.value)}
                          placeholder={`Step ${idx + 1}...`}
                          rows={2}
                          className="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                        />
                        <button onClick={() => removeInstruction(idx)} className="mt-2 p-1 text-slate-600 hover:text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {!(formData.instructions?.length) && (
                      <div className="text-center p-4 border border-dashed border-slate-700 rounded-xl text-slate-500 text-sm">
                        No instructions added yet.
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Media */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider border-b border-slate-800 pb-2">Media & Guides</h3>
                <MediaUploader 
                  mediaUrls={formData.media_urls || []} 
                  onChange={(urls) => setFormData({ ...formData, media_urls: urls })} 
                  maxFiles={3}
                />
              </section>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-950">
              {formData.id && (
                <p className="text-[11px] text-slate-500 text-center mb-3">
                  💾 Thay đổi được tự động lưu. Nút dưới dùng để đóng & xác nhận.
                </p>
              )}
              <button 
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
              >
                <Save className="w-5 h-5" />
                {formData.id ? 'DONE — ĐÃ TỰ ĐỘNG LƯU' : 'SAVE EXERCISE'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
