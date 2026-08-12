'use client';

import * as React from 'react';
import { SubscriptionManager } from '@/modules/admin-shell/components/subscription-manager';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';
import { CreditCard } from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const [loading, setLoading] = React.useState(false);

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
            subscriptions={[
              {id: '1', tier_name: 'Free', feature_limits: {max_routines: 3}}, 
              {id: '2', tier_name: 'Pro', feature_limits: {max_routines: -1, has_ai_coach: true}}
            ]}
            onSaveSubscription={() => {}}
            onDeleteSubscription={() => {}}
          />
        )}
      </div>
    </PermissionGuard>
  );
}
