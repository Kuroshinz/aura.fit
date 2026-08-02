'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { AdminUserRecord } from '@/repositories/users/user-repository';
import { DataTable } from '@/components/ui/data-table';

import { MoreVertical, Shield, ShieldOff, Ban } from 'lucide-react';

export const getUserColumns = (
  onUpdateRole: (id: string, role: string) => void,
  onSuspend: (id: string, suspend: boolean) => void
): ColumnDef<AdminUserRecord>[] => [
  {
    accessorKey: 'full_name',
    header: 'Name',
    cell: ({ row }) => {
      const name = row.getValue('full_name') as string || 'Unknown User';
      const initials = name.substring(0, 2).toUpperCase();
      const isSuspended = row.original.role === 'suspended';
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
            {initials}
          </div>
          <span className={`font-medium ${isSuspended ? 'text-slate-500 line-through' : 'text-white'}`}>{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      const color = role === 'admin' 
        ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
        : role === 'suspended'
        ? 'text-red-400 bg-red-500/10 border-red-500/20'
        : 'text-slate-300 bg-slate-800 border-slate-700';
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
      const user = row.original;
      const [isOpen, setIsOpen] = React.useState(false);
      
      return (
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <div className="absolute right-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-1">
                  {user.role !== 'admin' ? (
                    <button 
                      onClick={() => { onUpdateRole(user.id, 'admin'); setIsOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Shield className="w-4 h-4" /> Make Admin
                    </button>
                  ) : (
                    <button 
                      onClick={() => { onUpdateRole(user.id, 'user'); setIsOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <ShieldOff className="w-4 h-4" /> Demote to User
                    </button>
                  )}
                  
                  {user.role !== 'suspended' ? (
                    <button 
                      onClick={() => { onSuspend(user.id, true); setIsOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Ban className="w-4 h-4" /> Suspend User
                    </button>
                  ) : (
                    <button 
                      onClick={() => { onSuspend(user.id, false); setIsOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Ban className="w-4 h-4" /> Restore User
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      );
    },
  },
];

interface UserTableProps {
  users: AdminUserRecord[];
  onUpdateRole: (id: string, role: string) => void;
  onSuspend: (id: string, suspend: boolean) => void;
}

export function UserTable({ users, onUpdateRole, onSuspend }: UserTableProps) {
  const columns = React.useMemo(() => getUserColumns(onUpdateRole, onSuspend), [onUpdateRole, onSuspend]);
  return <DataTable columns={columns} data={users} />;
}
