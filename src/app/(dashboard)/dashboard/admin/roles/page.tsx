'use client';

import * as React from 'react';
import { RoleBuilder } from '@/modules/admin-shell/components/role-builder';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';
import { Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminRolesPage() {
  const [roles, setRoles] = React.useState<any[]>([]);
  const [permissions, setPermissions] = React.useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = React.useState<Record<string, string[]>>({});
  const [loading, setLoading] = React.useState(true);

  const loadData = async () => {
    const supabase = createClient();
    
    // Fetch Roles
    const { data: rolesData } = await supabase.from('roles').select('*').order('name');
    
    // Fetch Permissions
    const { data: permsData } = await supabase.from('permissions').select('*');
    
    // Fetch Role Permissions
    const { data: rolePermsData } = await supabase.from('role_permissions').select('*');

    if (rolesData) setRoles(rolesData);
    if (permsData) setPermissions(permsData);
    
    if (rolePermsData) {
      const rpMap: Record<string, string[]> = {};
      rolePermsData.forEach(rp => {
        if (!rpMap[rp.role_id]) rpMap[rp.role_id] = [];
        rpMap[rp.role_id].push(rp.permission_id);
      });
      setRolePermissions(rpMap);
    }
    
    setLoading(false);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleSaveRole = async (role: any, selectedPermIds: string[]) => {
    const supabase = createClient();
    try {
      let roleId = role.id;
      
      // 1. Upsert Role
      if (roleId) {
        const { error } = await supabase.from('roles').update({
          name: role.name,
          description: role.description
        }).eq('id', roleId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('roles').insert({
          name: role.name,
          description: role.description,
          is_system: false
        }).select().single();
        if (error) throw error;
        roleId = data.id;
      }

      // 2. Sync Permissions
      if (roleId) {
        await supabase.from('role_permissions').delete().eq('role_id', roleId);
        if (selectedPermIds.length > 0) {
          const inserts = selectedPermIds.map(pid => ({ role_id: roleId, permission_id: pid }));
          await supabase.from('role_permissions').insert(inserts);
        }
      }

      alert('Role saved successfully!');
      loadData();
    } catch (err: any) {
      alert(`Error saving role: ${err.message}`);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('roles').delete().eq('id', id);
    if (error) {
      alert(`Error deleting role: ${error.message}`);
    } else {
      loadData();
    }
  };

  return (
    <PermissionGuard permission="manage:roles" fallback={<div>Unauthorized</div>}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Shield className="w-8 h-8 text-amber-500" />
              Role Builder
            </h1>
            <p className="text-slate-400 mt-1">Manage platform roles and granular permissions.</p>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center border border-slate-800 rounded-xl bg-slate-900/20">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <RoleBuilder 
            roles={roles} 
            permissions={permissions} 
            rolePermissions={rolePermissions} 
            onSaveRole={handleSaveRole} 
            onDeleteRole={handleDeleteRole} 
          />
        )}
      </div>
    </PermissionGuard>
  );
}
