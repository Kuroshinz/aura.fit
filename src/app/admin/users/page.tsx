'use client';

import * as React from 'react';
import { UserTable } from '@/modules/users/components/user-table';
import { RoleBuilder } from '@/modules/admin-shell/components/role-builder';
import { SubscriptionManager } from '@/modules/admin-shell/components/subscription-manager';
import { userService } from '@/services/users/user-service';
import { AdminUserRecord } from '@/repositories/users/user-repository';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';
import { Users, Search, Shield, CreditCard } from 'lucide-react';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = React.useState<'users' | 'roles' | 'subscriptions'>('users');
  const [users, setUsers] = React.useState<AdminUserRecord[]>([]);
  const [roles, setRoles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      const [usersRes, rolesRes] = await Promise.all([
        userService.getAllUsers(),
        userService.getAllRoles()
      ]);
      
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
      if (rolesRes.success && rolesRes.data) {
        setRoles(rolesRes.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  async function handleUpdateRole(id: string, role_id: string) {
    const newRole = roles.find(r => r.id === role_id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role_id, roles: newRole || u.roles } : u));
    const res = await userService.updateUserRole(id, role_id);
    if (!res.success) {
      const [usersRes] = await Promise.all([userService.getAllUsers()]);
      if (usersRes.success && usersRes.data) setUsers(usersRes.data);
      alert(`Failed to update role: ${res.error?.message}`);
    }
  }

  async function handleSuspend(id: string, suspend: boolean) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: suspend ? 'suspended' : 'active' } : u));
    const res = await userService.suspendUser(id, suspend);
    if (!res.success) {
      const [usersRes] = await Promise.all([userService.getAllUsers()]);
      if (usersRes.success && usersRes.data) setUsers(usersRes.data);
      alert(`Failed to suspend/restore user: ${res.error?.message}`);
    }
  }

  return (
    <PermissionGuard permission="manage:users" fallback={<div>Unauthorized</div>}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-amber-500" />
              Access Management
            </h1>
            <p className="text-slate-400 mt-1">Manage platform users, roles, and subscriptions.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-800 pb-2">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-bold text-sm transition-colors ${activeTab === 'users' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Users</div>
          </button>
          <button 
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 font-bold text-sm transition-colors ${activeTab === 'roles' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Role Builder</div>
          </button>
          <button 
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 font-bold text-sm transition-colors ${activeTab === 'subscriptions' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <div className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Subscriptions</div>
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center border border-slate-800 rounded-xl bg-slate-900/20">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-amber-500">
                      <option value="all">All Roles</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                </div>
                <UserTable users={users} onUpdateRole={handleUpdateRole} onSuspend={handleSuspend} roles={roles} />
              </div>
            )}

            {activeTab === 'roles' && (
              <RoleBuilder 
                roles={roles} 
                permissions={[{id:'1', resource:'users', action:'manage'}, {id:'2', resource:'exercises', action:'view'}]} 
                rolePermissions={{}} 
                onSaveRole={() => {}} 
                onDeleteRole={() => {}} 
              />
            )}

            {activeTab === 'subscriptions' && (
              <SubscriptionManager 
                subscriptions={[{id: '1', tier_name: 'Free', feature_limits: {max_routines: 3}}, {id: '2', tier_name: 'Pro', feature_limits: {max_routines: -1, has_ai_coach: true}}]}
                onSaveSubscription={() => {}}
                onDeleteSubscription={() => {}}
              />
            )}
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
