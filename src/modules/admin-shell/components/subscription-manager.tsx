'use client';

import * as React from 'react';
import { CreditCard, Save, Plus, Trash2 } from 'lucide-react';

interface Subscription {
  id: string;
  tier_name: string;
  feature_limits: Record<string, any>;
}

interface SubscriptionManagerProps {
  subscriptions: Subscription[];
  onSaveSubscription: (sub: Partial<Subscription>) => void;
  onDeleteSubscription: (id: string) => void;
}

export function SubscriptionManager({ subscriptions, onSaveSubscription, onDeleteSubscription }: SubscriptionManagerProps) {
  const [selectedSubId, setSelectedSubId] = React.useState<string | null>(subscriptions[0]?.id || null);
  const [editingSub, setEditingSub] = React.useState<Partial<Subscription> | null>(null);

  React.useEffect(() => {
    if (selectedSubId) {
      const sub = subscriptions.find(s => s.id === selectedSubId);
      if (sub) {
        setEditingSub({ ...sub });
      }
    }
  }, [selectedSubId, subscriptions]);

  const handleLimitChange = (key: string, value: string | boolean | number) => {
    if (!editingSub) return;
    setEditingSub({
      ...editingSub,
      feature_limits: {
        ...editingSub.feature_limits,
        [key]: value
      }
    });
  };

  const handleSave = () => {
    if (editingSub && editingSub.tier_name) {
      onSaveSubscription(editingSub);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Subscriptions List */}
      <div className="w-full md:w-64 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" /> Tiers
          </h3>
          <button 
            onClick={() => {
              setSelectedSubId(null);
              setEditingSub({ tier_name: 'New Tier', feature_limits: { max_routines: 3, has_ai_coach: false } });
            }}
            className="p-1.5 bg-slate-800 text-slate-300 hover:text-indigo-400 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {subscriptions.map(sub => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubId(sub.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                selectedSubId === sub.id 
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold shadow-inner' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              {sub.tier_name}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      {editingSub && (
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {editingSub.id ? 'Edit Tier' : 'Create New Tier'}
            </h3>
            <div className="flex items-center gap-3">
              {editingSub.id && (
                <button 
                  onClick={() => onDeleteSubscription(editingSub.id as string)}
                  className="p-2 text-slate-500 hover:text-red-400 bg-slate-950 hover:bg-red-500/10 rounded-lg transition-colors border border-slate-800 hover:border-red-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-500 text-white font-bold text-sm rounded-lg hover:bg-indigo-400 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Tier
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Tier Name</label>
              <input 
                type="text"
                value={editingSub.tier_name || ''}
                onChange={e => setEditingSub({...editingSub, tier_name: e.target.value})}
                className="w-full sm:w-1/2 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-3 border-b border-slate-800 pb-2">Feature Limits (JSON)</label>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-300">Max Routines</div>
                    <div className="text-xs text-slate-500">Maximum saved routines allowed (-1 for unlimited)</div>
                  </div>
                  <input 
                    type="number"
                    value={editingSub.feature_limits?.max_routines ?? 3}
                    onChange={(e) => handleLimitChange('max_routines', parseInt(e.target.value))}
                    className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-center text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-300">AI Coach Access</div>
                    <div className="text-xs text-slate-500">Enable advanced AI suggestions and planning</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={!!editingSub.feature_limits?.has_ai_coach}
                      onChange={(e) => handleLimitChange('has_ai_coach', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-300">Detailed Analytics</div>
                    <div className="text-xs text-slate-500">Access to advanced body metrics and muscle heatmaps</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={!!editingSub.feature_limits?.has_analytics}
                      onChange={(e) => handleLimitChange('has_analytics', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
