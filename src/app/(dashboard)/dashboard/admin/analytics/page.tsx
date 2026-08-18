'use client';

import * as React from 'react';
import { BarChart3, Users, Dumbbell, TrendingUp, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const PIE_COLORS = ['#f59e0b', '#6366f1', '#10b981', '#06b6d4'];

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = React.useState(true);

  const [stats, setStats] = React.useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalWorkouts: 0,
    totalVolume: 0
  });

  const [growthData, setGrowthData] = React.useState<any[]>([]);
  const [workoutData, setWorkoutData] = React.useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      // ---- Metric 1: Total Users ----
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // ---- Subscriptions ----
      const { data: profiles } = await supabase
        .from('profiles')
        .select('subscription_id, subscriptions(name)');

      let activeSubs = 0;
      const subCounts: Record<string, number> = {};
      (profiles || []).forEach((p: any) => {
        const name = p.subscriptions?.name || 'Free';
        if (p.subscription_id) activeSubs++;
        subCounts[name] = (subCounts[name] || 0) + 1;
      });

      const subscriptionDataArr = Object.entries(subCounts).map(([name, value]) => ({
        name,
        value
      }));

      // ---- Workout Logs ----
      const { count: totalWorkouts } = await supabase
        .from('workout_logs')
        .select('*', { count: 'exact', head: true });

      // ---- Aggregate Volume ----
      const { data: volumeRows } = await supabase
        .from('workout_logs')
        .select('total_volume');

      let totalVolume = 0;
      (volumeRows || []).forEach((r: any) => totalVolume += (r.total_volume || 0));

      setStats({
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubs,
        totalWorkouts: totalWorkouts || 0,
        totalVolume: Math.round(totalVolume)
      });
      setSubscriptionData(subscriptionDataArr);

      // ---- Growth Data (profiles grouped by month) ----
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: true });

      const monthMap: Record<string, number> = {};
      (allProfiles || []).forEach((p: any) => {
        const d = new Date(p.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap[key] = (monthMap[key] || 0) + 1;
      });

      const growthDataArr = Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, users]) => ({
          month,
          users
        }));
      setGrowthData(growthDataArr);

      // ---- Workout Activity (last 7 days) ----
      const now = new Date();
      const last7: any[] = [];
      const dayMap: Record<string, number> = {};

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dayMap[key] = 0;
        last7.push(key);
      }

      const { data: recentLogs } = await supabase
        .from('workout_logs')
        .select('created_at')
        .gte('created_at', last7[0] + 'T00:00:00');

      (recentLogs || []).forEach((log: any) => {
        const key = log.created_at?.slice(0, 10);
        if (dayMap[key] !== undefined) dayMap[key]++;
      });

      const workoutDataArr = last7.map(day => {
        const d = new Date(day + 'T00:00:00');
        return {
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          workouts: dayMap[day]
        };
      });
      setWorkoutData(workoutDataArr);

      setLoading(false);
    }
    loadData();
  }, []);

  const metricCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    { label: 'Active Subscriptions', value: stats.activeSubscriptions, icon: TrendingUp, color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
    { label: 'Total Workouts', value: stats.totalWorkouts, icon: Dumbbell, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    { label: 'Total Volume (kg)', value: stats.totalVolume.toLocaleString(), icon: Activity, color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  ];

  const chartCardClass = "bg-slate-900/50 border border-slate-800 rounded-2xl p-6";

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PermissionGuard permission="view:analytics" fallback={<div>Unauthorized</div>}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-amber-500" />
              Analytics Dashboard
            </h1>
            <p className="text-slate-400 mt-1">Real-time overview of platform health and user engagement.</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {metricCards.map(card => (
            <div key={card.label} className={`rounded-2xl p-5 border ${card.color} backdrop-blur-sm`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">{card.label}</span>
                <card.icon className={`w-5 h-5 ${card.color.split(' ')[0]}`} />
              </div>
              <p className="text-3xl font-black text-white">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Growth + Workouts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className={chartCardClass}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              User Growth
            </h2>
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#475569" fontSize={12} />
                  <YAxis stroke="#475569" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#f59e0b" fill="url(#growthGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-slate-500 text-sm">
                No registration data yet.
              </div>
            )}
          </div>

          <div className={chartCardClass}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-indigo-400" />
              Workout Activity (7 days)
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={workoutData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#475569" fontSize={12} />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="workouts" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Donut */}
        <div className={chartCardClass}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Subscription Distribution
          </h2>
          {subscriptionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
              No subscription data yet.
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}
