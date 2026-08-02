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
          <ExerciseTable exercises={exercises} />
        )}
      </div>
    </PermissionGuard>
  );
}
