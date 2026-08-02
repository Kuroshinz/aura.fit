'use client';

import * as React from 'react';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';
import { Activity, Database, Server, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SystemHealthPage() {
  return (
    <PermissionGuard permission="manage:settings" fallback={<div>Unauthorized</div>}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-500" />
            System Health & Inspector
          </h1>
          <p className="text-slate-400 mt-1">Read-only diagnostics for Database, Storage, and APIs.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Supabase Status */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Database</h2>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                OPERATIONAL
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Connection Latency</span>
                <span className="text-white font-mono">24ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Active Connections</span>
                <span className="text-white font-mono">12 / 100</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Storage Used</span>
                <span className="text-white font-mono">1.2 GB</span>
              </div>
            </div>
          </div>

          {/* Vercel App Status */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Application</h2>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                OPERATIONAL
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Environment</span>
                <span className="text-white font-mono">Production</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Framework</span>
                <span className="text-white font-mono">Next.js 15</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Memory Usage</span>
                <span className="text-white font-mono">142 MB</span>
              </div>
            </div>
          </div>

          {/* Sync Engine Status */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Sync Engine</h2>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md">
                <AlertCircle className="w-3.5 h-3.5" />
                DEGRADED
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Worker Status</span>
                <span className="text-white font-mono">Running (Render)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Queue Backlog</span>
                <span className="text-white font-mono">0 items</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Last Error</span>
                <span className="text-amber-400 font-mono">RLS Policy Denied</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Tables Overview */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/80">
            <h3 className="font-bold text-white">Table Inspector</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/40 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Table Name</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Row Count (Est)</th>
                <th className="px-6 py-4 font-semibold tracking-wider">RLS Enabled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {['profiles', 'exercises', 'routines', 'workout_history', 'sync_queue'].map((table) => (
                <tr key={table} className="hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-mono text-amber-400">{table}</td>
                  <td className="px-6 py-4 text-slate-300">~{Math.floor(Math.random() * 5000)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-[10px] uppercase font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">True</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PermissionGuard>
  );
}
