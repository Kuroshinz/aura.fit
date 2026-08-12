'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { AdminUserRecord } from '@/repositories/users/user-repository';
import { DataTable } from '@/components/ui/data-table';
import { MoreHorizontal } from 'lucide-react';
import { UserDetailSlideover } from './user-detail-slideover';

interface UserTableProps {
  users: AdminUserRecord[];
  onUpdateRole: (id: string, role_id: string) => void;
  onSuspend: (id: string, suspend: boolean) => void;
  roles: { id: string, name: string }[];
}

export function UserTable({ users, onUpdateRole, onSuspend, roles }: UserTableProps) {
  const [selectedUser, setSelectedUser] = React.useState<AdminUserRecord | null>(null);

  const columns = React.useMemo<ColumnDef<AdminUserRecord>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const name = row.getValue('name') as string || 'Unknown User';
        const initials = name.substring(0, 2).toUpperCase();
        const isSuspended = row.original.status === 'suspended';
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">
              {initials}
            </div>
            <span className={`font-medium ${isSuspended ? 'text-slate-500 line-through' : 'text-white'}`}>{name}</span>
          </div>
        );
      },
    },
    {
      id: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.roles?.name || 'User';
        const color = role.toLowerCase() === 'admin' || role.toLowerCase() === 'owner'
          ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
          : row.original.status === 'suspended'
          ? 'text-red-400 bg-red-500/10 border-red-500/20'
          : 'text-slate-300 bg-slate-800 border-slate-700';
        return (
          <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md border ${color}`}>
            {role}
          </span>
        );
      },
    },
    {
      id: 'tier',
      header: 'Tier',
      cell: ({ row }) => {
        const tier = row.original.subscriptions?.tier_name || 'Free';
        const color = tier.toLowerCase() === 'pro'
          ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
          : 'text-slate-400 bg-slate-800 border-slate-700';
        return (
          <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md border ${color}`}>
            {tier}
          </span>
        );
      }
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
      header: '',
      cell: ({ row }) => (
        <button 
          onClick={() => setSelectedUser(row.original)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 text-xs font-bold uppercase"
        >
          Manage <MoreHorizontal className="w-4 h-4" />
        </button>
      ),
    },
  ], []);

  // Update selectedUser if the props change (e.g. after an optimistic update)
  React.useEffect(() => {
    if (selectedUser) {
      const updated = users.find(u => u.id === selectedUser.id);
      if (updated) setSelectedUser(updated);
    }
  }, [users]);

  return (
    <>
      <DataTable columns={columns} data={users} />
      <UserDetailSlideover 
        isOpen={!!selectedUser} 
        onClose={() => setSelectedUser(null)} 
        user={selectedUser}
        onUpdateRole={onUpdateRole}
        onSuspend={onSuspend}
        roles={roles}
      />
    </>
  );
}
