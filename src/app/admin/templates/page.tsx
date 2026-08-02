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
          <TemplateTable templates={templates} />
        )}
      </div>
    </PermissionGuard>
  );
}
