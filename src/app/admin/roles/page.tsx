'use client';

import * as React from 'react';
import { RoleBuilder } from '@/modules/admin-shell/components/role-builder';
import { userService } from '@/services/users/user-service';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';
import { Shield } from 'lucide-react';

export default function AdminRolesPage() {
  const [roles, setRoles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      const rolesRes = await userService.getAllRoles();
      if (rolesRes.success && rolesRes.data) {
        setRoles(rolesRes.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

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
            permissions={[
              {id:'1', resource:'users', action:'manage'}, 
              {id:'2', resource:'roles', action:'manage'},
              {id:'3', resource:'subscriptions', action:'manage'},
              {id:'4', resource:'analytics', action:'view'},
            ]} 
            rolePermissions={{}} 
            onSaveRole={() => {}} 
            onDeleteRole={() => {}} 
          />
        )}
      </div>
    </PermissionGuard>
  );
}
