'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { AdminUserRecord } from '@/repositories/users/user-repository';
import { DataTable } from '@/components/ui/data-table';

export const userColumns: ColumnDef<AdminUserRecord>[] = [
  {
    accessorKey: 'full_name',
    header: 'Name',
    cell: ({ row }) => {
      const name = row.getValue('full_name') as string || 'Unknown User';
      const initials = name.substring(0, 2).toUpperCase();
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
            {initials}
          </div>
          <span className="font-medium text-white">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      const color = role === 'admin' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-slate-300 bg-slate-800 border-slate-700';
      return (
        <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md border ${color}`}>
          {role || 'user'}
        </span>
      );
    },
  },
  {
    accessorKey: 'workout_count',
    header: 'Workouts',
  },
  {
    accessorKey: 'created_at',
    header: 'Joined',
    cell: ({ row }) => {
      const dateStr = row.getValue('created_at') as string;
      if (!dateStr) return '-';
      return new Date(dateStr).toLocaleDateString('vi-VN');
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      return (
        <button className="text-xs font-medium text-amber-500 hover:text-amber-400">
          View Details
        </button>
      );
    },
  },
];

interface UserTableProps {
  users: AdminUserRecord[];
}

export function UserTable({ users }: UserTableProps) {
  return <DataTable columns={userColumns} data={users} />;
}
