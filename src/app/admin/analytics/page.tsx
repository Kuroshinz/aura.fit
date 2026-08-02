'use client';

import * as React from 'react';
import { analyticsDashboardService, DashboardStats, ChartDataPoint } from '@/services/analytics/dashboard';
import dynamic from 'next/dynamic';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';

const DAUChart = dynamic(
  () => import('@/modules/analytics/components/dau-chart').then(mod => mod.DAUChart),
  { ssr: false, loading: () => <div className="h-72 w-full animate-pulse bg-slate-800 rounded-xl mt-4" /> }
);
import { BarChart3, Users, Activity, Dumbbell, ListTodo } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [dauData, setDauData] = React.useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadAnalytics() {
      const [statsRes, dauRes] = await Promise.all([
        analyticsDashboardService.getOverviewStats(),
        analyticsDashboardService.getDailyActiveUsers(14)
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (dauRes.success && dauRes.data) setDauData(dauRes.data);
      
      setLoading(false);
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PermissionGuard permission="view:analytics" fallback={<div>Unauthorized</div>}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-amber-500" />
            Platform Analytics
          </h1>
          <p className="text-slate-400 mt-1">Real-time performance metrics and usage data.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-400">Total Users</h3>
            </div>
            <p className="text-3xl font-black text-white">{stats?.totalUsers.toLocaleString()}</p>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-400">Active Today</h3>
            </div>
            <p className="text-3xl font-black text-white">{stats?.activeUsersToday.toLocaleString()}</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <Dumbbell className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-400">Workouts Today</h3>
            </div>
            <p className="text-3xl font-black text-white">{stats?.workoutsToday.toLocaleString()}</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <ListTodo className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-slate-400">Templates</h3>
            </div>
            <p className="text-3xl font-black text-white">{stats?.workoutTemplates.toLocaleString()}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-white mb-6">Daily Active Users (14 Days)</h2>
          <DAUChart data={dauData} />
        </div>
      </div>
    </PermissionGuard>
  );
}
