'use client';

import * as React from 'react';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';
import { ListTodo, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { TemplateBuilderSlideover } from '@/modules/templates/components/template-builder-slideover';

export default function AdminTemplatesPage() {
  const [loading, setLoading] = React.useState(true);
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [exercises, setExercises] = React.useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const [isSlideoverOpen, setIsSlideoverOpen] = React.useState(false);
  const [editingTemplate, setEditingTemplate] = React.useState<any | null>(null);

  const loadData = async () => {
    const supabase = createClient();
    
    // Fetch global templates
    const { data: routinesData } = await supabase
      .from('routines')
      .select('*, routine_exercises(id, target_sets, exercise:exercises(*))')
      .eq('is_global_template', true)
      .order('created_at', { ascending: false });
      
    if (routinesData) {
      // Map nested exercises
      const mapped = routinesData.map(r => ({
        ...r,
        exercises: (r.routine_exercises || []).map((re: any) => ({
          ...re,
          target_reps: '10-12' // fallback if not in schema yet
        }))
      }));
      setTemplates(mapped);
    }
    
    // Fetch all catalog exercises for the builder
    const { data: exData } = await supabase.from('exercises').select('*').order('name');
    if (exData) setExercises(exData);
    
    setLoading(false);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (templateData: any, routineExercises: any[]) => {
    const supabase = createClient();
    try {
      let routineId = templateData.id;
      
      // Upsert routine
      if (routineId) {
        const { error } = await supabase.from('routines').update({
          name: templateData.name,
          description: templateData.description,
          difficulty: templateData.difficulty,
          routine_type: templateData.routine_type,
          tags: templateData.tags
        }).eq('id', routineId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('routines').insert({
          name: templateData.name,
          description: templateData.description,
          difficulty: templateData.difficulty,
          routine_type: templateData.routine_type,
          tags: templateData.tags,
          is_global_template: true
        }).select().single();
        if (error) throw error;
        routineId = data.id;
      }
      
      // Upsert exercises
      if (routineId) {
        await supabase.from('routine_exercises').delete().eq('routine_id', routineId);
        
        if (routineExercises.length > 0) {
          const inserts = routineExercises.map((re, index) => ({
            routine_id: routineId,
            exercise_id: re.exercise_id,
            order_index: index,
            target_sets: re.target_sets || 3
          }));
          await supabase.from('routine_exercises').insert(inserts);
        }
      }
      
      alert('Template saved successfully!');
      setIsSlideoverOpen(false);
      loadData();
    } catch (e: any) {
      alert(`Error saving template: ${e.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this global template?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('routines').delete().eq('id', id);
    if (error) alert(`Error deleting template: ${error.message}`);
    else loadData();
  };

  const filtered = React.useMemo(() => {
    if (!searchQuery) return templates;
    return templates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [templates, searchQuery]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Template Name',
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div>
            <p className="font-bold text-white">{t.name}</p>
            <p className="text-xs text-slate-500 truncate max-w-xs">{t.description || 'No description'}</p>
          </div>
        );
      }
    },
    {
      accessorKey: 'routine_type',
      header: 'Type',
      cell: ({ row }) => {
        const t = row.original.routine_type;
        return t ? (
          <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
            {t}
          </span>
        ) : (
          <span className="text-slate-600 text-xs">-</span>
        );
      }
    },
    {
      accessorKey: 'difficulty',
      header: 'Difficulty',
      cell: ({ row }) => {
        const d = row.original.difficulty || 'Beginner';
        let color = 'text-green-400 bg-green-400/10 border-green-400/20';
        if (d === 'Intermediate') color = 'text-amber-400 bg-amber-400/10 border-amber-400/20';
        if (d === 'Advanced') color = 'text-red-400 bg-red-400/10 border-red-400/20';
        return <span className={`px-2 py-1 rounded text-xs font-bold border ${color}`}>{d}</span>;
      }
    },
    {
      id: 'exercises',
      header: 'Exercises',
      cell: ({ row }) => {
        const count = row.original.exercises?.length || 0;
        return <span className="text-slate-300 font-medium">{count} exercises</span>;
      }
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => {
              setEditingTemplate(row.original);
              setIsSlideoverOpen(true);
            }}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(row.original.id)}
            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <PermissionGuard permission="manage:templates" fallback={<div>Unauthorized</div>}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <ListTodo className="w-8 h-8 text-emerald-400" />
              Global Templates
            </h1>
            <p className="text-slate-400 mt-1">Manage official workout routines for users.</p>
          </div>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setIsSlideoverOpen(true);
            }}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl font-bold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Template
          </button>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center border border-slate-800 rounded-xl bg-slate-900/20">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <DataTable columns={columns} data={filtered} />
        )}

        <TemplateBuilderSlideover
          isOpen={isSlideoverOpen}
          onClose={() => setIsSlideoverOpen(false)}
          template={editingTemplate}
          onSave={handleSave}
          availableExercises={exercises}
        />
      </div>
    </PermissionGuard>
  );
}
