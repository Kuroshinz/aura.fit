'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { RoutineRecord } from '@/repositories/templates/template-repository';
import { DataTable } from '@/components/ui/data-table';
import { ListTodo, Copy, Trash2, Edit } from 'lucide-react';

export const templateColumns: ColumnDef<RoutineRecord>[] = [
  {
    accessorKey: 'name',
    header: 'Template Name',
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
            <ListTodo className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="font-medium text-white">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const desc = row.getValue('description') as string;
      return <span className="text-slate-400 line-clamp-1 max-w-[300px]">{desc || '-'}</span>;
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) => {
      const dateStr = row.getValue('created_at') as string;
      if (!dateStr) return '-';
      return <span className="text-slate-400">{new Date(dateStr).toLocaleDateString('vi-VN')}</span>;
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors" title="Duplicate">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Archive/Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      );
    },
  },
];

interface TemplateTableProps {
  templates: RoutineRecord[];
}

export function TemplateTable({ templates }: TemplateTableProps) {
  return <DataTable columns={templateColumns} data={templates} />;
}
