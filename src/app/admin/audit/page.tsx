'use client';

import * as React from 'react';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';
import { ShieldAlert, Download } from 'lucide-react';
import { auditService, AuditLogRecord } from '@/services/governance/audit-service';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

export const auditColumns: ColumnDef<AuditLogRecord>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    cell: ({ row }) => {
      const ts = row.getValue('timestamp') as string;
      return <span className="text-slate-400 font-mono text-xs">{new Date(ts).toLocaleString('vi-VN')}</span>;
    },
  },
  {
    accessorKey: 'user_id',
    header: 'User',
    cell: ({ row }) => <span className="font-mono text-emerald-400 text-xs">{row.getValue('user_id')}</span>,
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => <span className="font-bold text-amber-400 text-xs uppercase tracking-wider">{row.getValue('action')}</span>,
  },
  {
    accessorKey: 'target',
    header: 'Target',
    cell: ({ row }) => <span className="text-slate-300 font-mono text-xs">{row.getValue('target')}</span>,
  },
  {
    accessorKey: 'ip',
    header: 'IP Address',
    cell: ({ row }) => <span className="text-slate-500 font-mono text-xs">{row.getValue('ip')}</span>,
  },
];

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadLogs() {
      const res = await auditService.getRecentLogs();
      if (res.success && res.data) {
        setLogs(res.data);
      }
      setLoading(false);
    }
    loadLogs();
  }, []);

  return (
    <PermissionGuard permission="view:audit_logs" fallback={<div>Unauthorized</div>}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-rose-500" />
              Audit Logs
            </h1>
            <p className="text-slate-400 mt-1">Immutable ledger of all administrative actions and system events.</p>
          </div>
          <button className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 border border-slate-700">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center border border-slate-800 rounded-xl bg-slate-900/20">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <DataTable columns={auditColumns} data={logs} />
        )}
      </div>
    </PermissionGuard>
  );
}
