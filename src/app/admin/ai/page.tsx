'use client';

import * as React from 'react';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';
import { Sparkles, Play, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { aiQualityService, QualityReport } from '@/services/ai/ai-quality-service';

export default function AdminAICenterPage() {
  const [report, setReport] = React.useState<QualityReport | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [scanning, setScanning] = React.useState(false);

  React.useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    const res = await aiQualityService.getLatestReport();
    if (res.success && res.data) {
      setReport(res.data);
    }
    setLoading(false);
  }

  async function handleScan() {
    setScanning(true);
    await aiQualityService.runQualityScan();
    setTimeout(() => {
      loadReport();
      setScanning(false);
    }, 2000); // Simulate some delay for UI feel
  }

  return (
    <PermissionGuard permission="manage:settings" fallback={<div>Unauthorized</div>}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-amber-500" />
              AI Data Quality Center
            </h1>
            <p className="text-slate-400 mt-1">Automated anomaly detection, duplicate scanning, and metadata generation.</p>
          </div>
          <button 
            onClick={handleScan}
            disabled={scanning}
            className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {scanning ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Play className="w-4 h-4" />}
            {scanning ? 'Scanning...' : 'Run Full Scan'}
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center border border-slate-800 rounded-xl bg-slate-900/20">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black text-white">{report?.totalScanned}</span>
              <span className="text-sm font-semibold text-slate-400 mt-2">Exercises Scanned</span>
            </div>
            
            <div className="bg-slate-900/50 border border-red-500/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black text-red-400">{report?.duplicateNames}</span>
              <span className="text-sm font-semibold text-red-400/70 mt-2">Duplicate Names</span>
            </div>

            <div className="bg-slate-900/50 border border-amber-500/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black text-amber-400">{report?.missingMuscles}</span>
              <span className="text-sm font-semibold text-amber-400/70 mt-2">Missing Muscles</span>
            </div>

            <div className="bg-slate-900/50 border border-amber-500/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black text-amber-400">{report?.missingEquipment}</span>
              <span className="text-sm font-semibold text-amber-400/70 mt-2">Missing Equipment</span>
            </div>
          </div>
        )}

        {report && report.issues.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden mt-8">
            <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-white">Detected Anomalies</h3>
            </div>
            <div className="divide-y divide-slate-800/50">
              {report.issues.map((issue, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-800/40">
                  <div>
                    <p className="text-white font-medium">{issue.name}</p>
                    <p className="text-xs text-amber-400 mt-0.5">{issue.issue}</p>
                  </div>
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-md transition-colors">
                    Auto-Fix
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {report && report.issues.length === 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center mt-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
            <h3 className="text-lg font-bold text-white">Perfect Data Quality</h3>
            <p className="text-sm text-slate-400 mt-1">No anomalies or missing metadata detected.</p>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
