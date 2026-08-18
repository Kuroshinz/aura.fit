'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { ExerciseRecord } from '@/repositories/exercises/exercise-repository';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';
import { Dumbbell, Search, Plus, MoreHorizontal, Video, Image as ImageIcon } from 'lucide-react';
import { ExerciseSlideover } from '@/modules/exercises/components/exercise-slideover';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

export default function AdminExercisesPage() {
  const [exercises, setExercises] = React.useState<ExerciseRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingEx, setEditingEx] = React.useState<Partial<ExerciseRecord> | null>(null);
  const [isSlideoverOpen, setIsSlideoverOpen] = React.useState(false);

  // Search & Filter
  const [search, setSearch] = React.useState('');
  const [filterMuscle, setFilterMuscle] = React.useState('all');

  const loadExercises = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from('exercises').select('*').order('name', { ascending: true });
    if (data) setExercises(data);
    setLoading(false);
  };

  React.useEffect(() => {
    loadExercises();
  }, []);

  const handleSave = async (exData: Partial<ExerciseRecord>) => {
    const supabase = createClient();
    if (exData.id) {
      // Update
      const { error } = await supabase.from('exercises').update(exData).eq('id', exData.id);
      if (error) alert(error.message);
    } else {
      // Create
      const { error } = await supabase.from('exercises').insert([exData]);
      if (error) alert(error.message);
    }
    await loadExercises();
    setIsSlideoverOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;
    const supabase = createClient();
    await supabase.from('exercises').delete().eq('id', id);
    await loadExercises();
    setIsSlideoverOpen(false);
  };

  const filteredExercises = React.useMemo(() => {
    return exercises.filter(ex => {
      const matchName = ex.name.toLowerCase().includes(search.toLowerCase());
      const matchMuscle = filterMuscle === 'all' || ex.muscle_group === filterMuscle;
      return matchName && matchMuscle;
    });
  }, [exercises, search, filterMuscle]);

  const columns = React.useMemo<ColumnDef<ExerciseRecord>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Exercise',
      cell: ({ row }) => {
        const ex = row.original;
        const mediaUrl = ex.media_urls?.[0];
        const isVid = mediaUrl?.match(/\.(mp4|webm|ogg)$/i);
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
              {mediaUrl ? (
                isVid ? (
                  <div className="relative w-full h-full bg-black flex items-center justify-center text-slate-500">
                    <Video className="w-4 h-4" />
                  </div>
                ) : (
                  <img src={mediaUrl} alt={ex.name} className="w-full h-full object-cover" />
                )
              ) : (
                <Dumbbell className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <div>
              <div className="font-bold text-white">{ex.name}</div>
              <div className="text-xs text-slate-500">{ex.equipment}</div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'muscle_group',
      header: 'Target Muscle',
      cell: ({ row }) => (
        <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md border border-slate-700 bg-slate-800 text-slate-300">
          {row.getValue('muscle_group')}
        </span>
      )
    },
    {
      accessorKey: 'difficulty',
      header: 'Difficulty',
      cell: ({ row }) => {
        const diff = row.getValue('difficulty') as string || 'beginner';
        const colors = diff === 'beginner' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                     : diff === 'intermediate' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                     : 'text-red-400 bg-red-500/10 border-red-500/20';
        return (
          <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md border ${colors}`}>
            {diff}
          </span>
        );
      }
    },
    {
      id: 'media_count',
      header: 'Media',
      cell: ({ row }) => {
        const count = row.original.media_urls?.length || 0;
        return <div className="text-sm font-bold text-slate-400">{count} file(s)</div>;
      }
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button 
          onClick={() => { setEditingEx(row.original); setIsSlideoverOpen(true); }}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 text-xs font-bold uppercase"
        >
          Manage <MoreHorizontal className="w-4 h-4" />
        </button>
      ),
    },
  ], []);

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
          <button 
            onClick={() => { setEditingEx({}); setIsSlideoverOpen(true); }}
            className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Exercise
          </button>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search exercise name..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterMuscle}
              onChange={e => setFilterMuscle(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Muscles</option>
              {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center border border-slate-800 rounded-xl bg-slate-900/20">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <DataTable columns={columns} data={filteredExercises} />
        )}

        <ExerciseSlideover 
          isOpen={isSlideoverOpen}
          onClose={() => setIsSlideoverOpen(false)}
          exercise={editingEx}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </div>
    </PermissionGuard>
  );
}
