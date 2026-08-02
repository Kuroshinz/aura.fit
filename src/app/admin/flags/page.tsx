'use client';

import * as React from 'react';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';
import { Flag, ToggleLeft, ToggleRight } from 'lucide-react';
import { featureFlagService, FeatureFlag } from '@/services/governance/feature-flag-service';

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = React.useState<FeatureFlag[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadFlags();
  }, []);

  async function loadFlags() {
    setLoading(true);
    const res = await featureFlagService.getFlags();
    if (res.success && res.data) {
      setFlags(res.data);
    }
    setLoading(false);
  }

  async function handleToggle(id: string, current: boolean) {
    await featureFlagService.toggleFlag(id, !current);
    loadFlags();
  }

  return (
    <PermissionGuard permission="manage:feature_flags" fallback={<div>Unauthorized</div>}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Flag className="w-8 h-8 text-indigo-500" />
            Feature Flags
          </h1>
          <p className="text-slate-400 mt-1">Runtime toggles to enable/disable modules without deployment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
             <div className="h-32 flex items-center justify-center col-span-full">
               <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
             </div>
          ) : (
            flags.map((flag) => (
              <div key={flag.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white font-mono">{flag.flag_key}</h3>
                    <button onClick={() => handleToggle(flag.id, flag.is_enabled)}>
                      {flag.is_enabled ? (
                        <ToggleRight className="w-8 h-8 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-slate-400">{flag.description}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${flag.is_enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {flag.is_enabled ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}
