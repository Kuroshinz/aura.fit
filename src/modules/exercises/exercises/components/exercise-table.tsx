'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ExerciseRecord } from '@/repositories/exercises/exercise-repository';
import { DataTable } from '@/components/ui/data-table';
import { Dumbbell, Target, Pencil, Trash2 } from 'lucide-react';

export const getExerciseColumns = (
  onEdit: (exercise: ExerciseRecord) => void,
  onDelete: (id: string, name: string) => void
): ColumnDef<ExerciseRecord>[] => [
  {
    accessorKey: 'name',
    header: 'Exercise Name',
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      const isCustom = row.original.is_custom;
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="font-medium text-white block">{name}</span>
            {isCustom && <span className="text-[10px] text-amber-500 font-mono">CUSTOM</span>}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'muscle_group',
    header: 'Muscle Group',
    cell: ({ row }) => {
      const muscle = row.getValue('muscle_group') as string;
      return (
        <span className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded-md">
          {muscle}
        </span>
      );
    },
  },
  {
    accessorKey: 'equipment',
    header: 'Equipment',
    cell: ({ row }) => {
      const equip = row.getValue('equipment') as string;
      return <span className="text-slate-400">{equip || '-'}</span>;
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const ex = row.original;
      return (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(ex)}
            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(ex.id, ex.name)}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      );
    },
  },
];

interface ExerciseTableProps {
  exercises: ExerciseRecord[];
  onEdit: (exercise: ExerciseRecord) => void;
  onDelete: (id: string, name: string) => void;
}

export function ExerciseTable({ exercises, onEdit, onDelete }: ExerciseTableProps) {
  const columns = React.useMemo(() => getExerciseColumns(onEdit, onDelete), [onEdit, onDelete]);
  return <DataTable columns={columns} data={exercises} />;
}
