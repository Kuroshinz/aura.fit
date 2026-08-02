'use client';

import * as React from 'react';
import { TemplateTable } from '@/modules/templates/components/template-table';
import { templateService } from '@/services/templates/template-service';
import { RoutineRecord } from '@/repositories/templates/template-repository';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';
import { ListTodo, Search, Plus } from 'lucide-react';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = React.useState<RoutineRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [editingTpl, setEditingTpl] = React.useState<RoutineRecord | null>(null);

  React.useEffect(() => {
    async function loadTemplates() {
      const response = await templateService.getAllTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
      }
      setLoading(false);
    }
    loadTemplates();
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    setTemplates(prev => prev.filter(t => t.id !== id));
    
    const res = await templateService.deleteTemplate(id);
    if (!res.success) {
      alert(`Failed to delete template: ${res.error?.message}`);
      const response = await templateService.getAllTemplates();
      if (response.success && response.data) setTemplates(response.data);
    }
  }

  async function handleDuplicate(id: string) {
    const res = await templateService.duplicateTemplate(id);
    if (res.success && res.data) {
      setTemplates(prev => [res.data!, ...prev]);
    } else {
      alert(`Failed to duplicate: ${res.error?.message}`);
    }
  }

  function handleEdit(tpl: RoutineRecord) {
    setEditingTpl(tpl);
  }

  return (
    <PermissionGuard permission="manage:templates" fallback={<div>Unauthorized</div>}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <ListTodo className="w-8 h-8 text-emerald-500" />
              Workout Templates
            </h1>
            <p className="text-slate-400 mt-1">Manage global workout routines and default splits.</p>
          </div>
          <button className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center border border-slate-800 rounded-xl bg-slate-900/20">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <TemplateTable 
            templates={templates} 
            onDuplicate={handleDuplicate}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Basic Edit Modal */}
      {editingTpl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Edit Template</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase">Name</label>
                <input type="text" defaultValue={editingTpl.name} className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase">Description</label>
                <textarea defaultValue={editingTpl.description || ''} rows={3} className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white resize-none" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingTpl(null)} className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg font-medium">
                Cancel
              </button>
              <button onClick={() => { alert('Save functionality not fully connected yet.'); setEditingTpl(null); }} className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </PermissionGuard>
  );
}
