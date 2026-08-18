'use client';

import * as React from 'react';
import { X, Save, Search, Plus, Trash2, GripVertical, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TemplateBuilderSlideover({
  isOpen,
  onClose,
  template,
  onSave,
  availableExercises
}: {
  isOpen: boolean;
  onClose: () => void;
  template?: any;
  onSave: (data: any, exercises: any[]) => void;
  availableExercises: any[];
}) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [difficulty, setDifficulty] = React.useState('Beginner');
  const [routineType, setRoutineType] = React.useState('Full Body');
  const [tags, setTags] = React.useState('');
  
  const [routineExercises, setRoutineExercises] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      if (template) {
        setName(template.name || '');
        setDescription(template.description || '');
        setDifficulty(template.difficulty || 'Beginner');
        setRoutineType(template.routine_type || 'Full Body');
        setTags((template.tags || []).join(', '));
        setRoutineExercises(template.exercises || []);
      } else {
        setName('');
        setDescription('');
        setDifficulty('Beginner');
        setRoutineType('Full Body');
        setTags('');
        setRoutineExercises([]);
      }
    }
  }, [isOpen, template]);

  const handleSave = () => {
    onSave({
      id: template?.id,
      name,
      description,
      difficulty,
      routine_type: routineType,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    }, routineExercises);
  };

  const addExercise = (ex: any) => {
    setRoutineExercises(prev => [...prev, {
      id: Math.random().toString(36).substring(7), // temp ID
      exercise_id: ex.id,
      exercise: ex,
      target_sets: 3,
      target_reps: '10-12'
    }]);
  };

  const removeExercise = (index: number) => {
    setRoutineExercises(prev => prev.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: string, value: any) => {
    setRoutineExercises(prev => prev.map((ex, i) => {
      if (i === index) return { ...ex, [field]: value };
      return ex;
    }));
  };

  const filteredExercises = React.useMemo(() => {
    if (!searchQuery) return availableExercises.slice(0, 20);
    const q = searchQuery.toLowerCase();
    return availableExercises.filter(ex => 
      ex.name.toLowerCase().includes(q) || 
      (ex.muscle_group && ex.muscle_group.toLowerCase().includes(q))
    ).slice(0, 20);
  }, [availableExercises, searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[600px] xl:w-[800px] bg-[#03030a] border-l border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
              <h2 className="text-xl font-bold text-white">
                {template ? 'Edit Template' : 'Create Template'}
              </h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider">Basic Info</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">Template Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                      placeholder="e.g. Full Body Beginner"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none h-24 resize-none"
                      placeholder="Template description..."
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 font-medium mb-1">Type</label>
                      <select
                        value={routineType}
                        onChange={e => setRoutineType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                      >
                        <option value="Full Body">Full Body</option>
                        <option value="Upper Body">Upper Body</option>
                        <option value="Lower Body">Lower Body</option>
                        <option value="Push">Push</option>
                        <option value="Pull">Pull</option>
                        <option value="Legs">Legs</option>
                        <option value="Cardio">Cardio</option>
                        <option value="Mobility">Mobility</option>
                        <option value="Core">Core</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 font-medium mb-1">Difficulty</label>
                      <select
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 font-medium mb-1">Tags (comma sep)</label>
                      <input
                        type="text"
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                        placeholder="e.g. Strength"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Workout Builder */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Workout Builder</span>
                  <span className="text-slate-400 text-xs bg-slate-800 px-2 py-1 rounded-full">{routineExercises.length} Exercises</span>
                </h3>
                
                <div className="flex flex-col xl:flex-row gap-6">
                  {/* Left: Added Exercises */}
                  <div className="flex-1 space-y-3">
                    {routineExercises.length === 0 ? (
                      <div className="h-48 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                        <GripVertical className="w-8 h-8 mb-2 opacity-50" />
                        <p>No exercises added yet.</p>
                        <p className="text-xs mt-1">Search and click + to add exercises.</p>
                      </div>
                    ) : (
                      routineExercises.map((ex, idx) => (
                        <div key={ex.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-slate-600 cursor-grab" />
                              <div className="w-8 h-8 rounded bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-slate-400">
                                {idx + 1}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white leading-tight">{ex.exercise?.name}</h4>
                                <p className="text-xs text-slate-400">{ex.exercise?.muscle_group}</p>
                              </div>
                            </div>
                            <button onClick={() => removeExercise(idx)} className="text-slate-500 hover:text-red-400 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3 pl-11">
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500">Sets</label>
                              <input 
                                type="number" 
                                value={ex.target_sets}
                                onChange={(e) => updateExercise(idx, 'target_sets', parseInt(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm text-white focus:border-amber-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500">Reps (Target)</label>
                              <input 
                                type="text" 
                                value={ex.target_reps}
                                onChange={(e) => updateExercise(idx, 'target_reps', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm text-white focus:border-amber-500 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Right: Exercise Search */}
                  <div className="w-full xl:w-72 shrink-0 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden max-h-[500px]">
                    <div className="p-3 border-b border-slate-800">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Search exercises..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-none">
                      {filteredExercises.map(ex => (
                        <div key={ex.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition-colors group">
                          <div className="min-w-0 pr-2">
                            <p className="text-sm text-slate-200 truncate font-medium">{ex.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate">{ex.muscle_group}</p>
                          </div>
                          <button 
                            onClick={() => addExercise(ex)}
                            className="w-6 h-6 rounded-md bg-slate-800 group-hover:bg-amber-500 text-slate-400 group-hover:text-black flex items-center justify-center shrink-0 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {filteredExercises.length === 0 && (
                        <div className="p-4 text-center text-slate-500 text-sm">
                          No exercises found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-950 shrink-0">
              <button
                onClick={handleSave}
                disabled={!name.trim() || routineExercises.length === 0}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                Save Template
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
