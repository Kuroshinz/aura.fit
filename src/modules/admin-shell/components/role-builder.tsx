'use client';

import * as React from 'react';
import { Shield, Plus, Save, Trash2 } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
}

interface Permission {
  id: string;
  resource: string;
  action: string;
}

interface RoleBuilderProps {
  roles: Role[];
  permissions: Permission[];
  rolePermissions: Record<string, string[]>; // Map of role_id to permission_id[]
  onSaveRole: (role: Partial<Role>, permissions: string[]) => void;
  onDeleteRole: (id: string) => void;
}

export function RoleBuilder({ roles, permissions, rolePermissions, onSaveRole, onDeleteRole }: RoleBuilderProps) {
  const [selectedRoleId, setSelectedRoleId] = React.useState<string | null>(roles[0]?.id || null);
  const [editingRole, setEditingRole] = React.useState<Partial<Role> | null>(null);
  const [selectedPerms, setSelectedPerms] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (selectedRoleId) {
      const role = roles.find(r => r.id === selectedRoleId);
      setEditingRole(role || null);
      setSelectedPerms(rolePermissions[selectedRoleId] || []);
    }
  }, [selectedRoleId, roles, rolePermissions]);

  const togglePermission = (permId: string) => {
    setSelectedPerms(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleSave = () => {
    if (editingRole && editingRole.name) {
      onSaveRole(editingRole, selectedPerms);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Roles List */}
      <div className="w-full md:w-64 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" /> Roles
          </h3>
          <button 
            onClick={() => {
              setSelectedRoleId(null);
              setEditingRole({ name: 'New Role', description: '', is_system: false });
              setSelectedPerms([]);
            }}
            className="p-1.5 bg-slate-800 text-slate-300 hover:text-amber-400 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                selectedRoleId === role.id 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold shadow-inner' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              {role.name}
              {role.is_system && <span className="ml-2 text-[9px] uppercase bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">System</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Role Editor */}
      {editingRole && (
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {editingRole.id ? 'Edit Role' : 'Create New Role'}
            </h3>
            <div className="flex items-center gap-3">
              {editingRole.id && !editingRole.is_system && (
                <button 
                  onClick={() => onDeleteRole(editingRole.id as string)}
                  className="p-2 text-slate-500 hover:text-red-400 bg-slate-950 hover:bg-red-500/10 rounded-lg transition-colors border border-slate-800 hover:border-red-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-amber-500 text-black font-bold text-sm rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Role
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Role Name</label>
                <input 
                  type="text"
                  value={editingRole.name || ''}
                  onChange={e => setEditingRole({...editingRole, name: e.target.value})}
                  disabled={editingRole.is_system}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Description</label>
                <input 
                  type="text"
                  value={editingRole.description || ''}
                  onChange={e => setEditingRole({...editingRole, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-3 border-b border-slate-800 pb-2">Permissions</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {permissions.map(perm => {
                  const isSelected = selectedPerms.includes(perm.id);
                  return (
                    <button
                      key={perm.id}
                      onClick={() => togglePermission(perm.id)}
                      disabled={editingRole.is_system && isSelected} // Cannot remove permissions from system roles (ideally)
                      className={`text-left p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/30 shadow-inner'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700'
                      }`}>
                        {isSelected && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-300'}`}>{perm.resource}</div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase">{perm.action}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
