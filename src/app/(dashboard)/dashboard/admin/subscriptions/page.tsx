'use client';

import * as React from 'react';
import { SubscriptionManager } from '@/modules/admin-shell/components/subscription-manager';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';
import { CreditCard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminSubscriptionsPage() {
  const [loading, setLoading] = React.useState(true);
  const [subscriptions, setSubscriptions] = React.useState<any[]>([]);

  const loadData = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('subscriptions').select('*').order('tier_name');
    if (data) setSubscriptions(data);
    setLoading(false);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (sub: any) => {
    const supabase = createClient();
    try {
      if (sub.id) {
        const { error } = await supabase.from('subscriptions').update({
          tier_name: sub.tier_name,
          feature_limits: sub.feature_limits
        }).eq('id', sub.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('subscriptions').insert({
          tier_name: sub.tier_name,
          feature_limits: sub.feature_limits
        });
        if (error) throw error;
      }
      alert('Subscription tier saved successfully!');
      loadData();
    } catch (e: any) {
      alert(`Error saving subscription: ${e.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription tier?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('subscriptions').delete().eq('id', id);
    if (error) alert(`Error deleting subscription: ${error.message}`);
    else loadData();
  };

  return (
    <PermissionGuard permission="manage:subscriptions" fallback={<div>Unauthorized</div>}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-indigo-400" />
              Subscriptions
            </h1>
            <p className="text-slate-400 mt-1">Manage subscription tiers and feature limits.</p>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center border border-slate-800 rounded-xl bg-slate-900/20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <SubscriptionManager 
            subscriptions={subscriptions}
            onSaveSubscription={handleSave}
            onDeleteSubscription={handleDelete}
          />
        )}
      </div>
    </PermissionGuard>
  );
}
