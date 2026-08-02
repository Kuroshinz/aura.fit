'use client';

import * as React from 'react';
import { ExerciseTable } from '@/modules/exercises/components/exercise-table';
import { exerciseService } from '@/services/exercises/exercise-service';
import { ExerciseRecord } from '@/repositories/exercises/exercise-repository';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';
import { Dumbbell, Search, Plus } from 'lucide-react';

export default function AdminExercisesPage() {
  const [exercises, setExercises] = React.useState<ExerciseRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [editingEx, setEditingEx] = React.useState<ExerciseRecord | null>(null);

  React.useEffect(() => {
    async function loadExercises() {
      const response = await exerciseService.getAllExercises();
      if (response.success && response.data) {
        setExercises(response.data);
      }
      setLoading(false);
    }
    loadExercises();
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    // Optimistic
    setExercises(prev => prev.filter(ex => ex.id !== id));
    
    const res = await exerciseService.deleteExercise(id);
    if (!res.success) {
      alert(`Failed to delete exercise: ${res.error?.message}`);
      // Revert optimism by reloading
      const response = await exerciseService.getAllExercises();
      if (response.success && response.data) setExercises(response.data);
    }
  }

  function handleEdit(ex: ExerciseRecord) {
    setEditingEx(ex);
  }

  return (
    <PermissionGuard permission="manage:exercises" fallback={<div>Unauthorized</div>}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Dumbbell className="w-8 h-8 text-amber-500" />
              Exercise Library
            </h1>
            <p className="text-slate-400 mt-1">Manage global exercises, categories, and media.</p>
          </div>
          <button className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Exercise
          </button>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search exercise name..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-amber-500">
              <option value="all">All Muscles</option>
              <option value="Chest">Chest</option>
              <option value="Back">Back</option>
              <option value="Legs">Legs</option>
              <option value="Shoulders">Shoulders</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center border border-slate-800 rounded-xl bg-slate-900/20">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ExerciseTable exercises={exercises} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      {/* Basic Edit Modal */}
      {editingEx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Edit Exercise</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase">Name</label>
                <input type="text" defaultValue={editingEx.name} className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase">Muscle Group</label>
                <input type="text" defaultValue={editingEx.muscle_group || ''} className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingEx(null)} className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg font-medium">
                Cancel
              </button>
              <button onClick={() => { alert('Save functionality not fully connected yet.'); setEditingEx(null); }} className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </PermissionGuard>
  );
}
