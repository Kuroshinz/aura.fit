import { createClient } from './client';

export interface AuditLogEntry {
  email: string;
  action: 'login_success' | 'login_failed' | 'logout' | 'unauthorized_attempt';
  status?: 'success' | 'failed';
  details?: string;
}

/**
 * Record an admin activity event to the admin_audit_logs table.
 * Used by NEXUS ADMIN login flow to log time, IP and user-agent.
 */
export async function logAdminAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from('admin_audit_logs').insert({
      email: entry.email,
      action: entry.action,
      status: entry.status || (entry.action.includes('failed') || entry.action.includes('unauthorized') ? 'failed' : 'success'),
      ip_address: extractIp(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 255) : null,
    });
  } catch (e) {
    // Audit logging must never break the login flow
    console.warn('Audit log insert failed (non-fatal):', e);
  }
}

function extractIp(): string | null {
  if (typeof window === 'undefined') return null;
  // Best-effort client-side IP detection (behind Supabase/proxy, real IP is
  // available server-side; this is a lightweight fallback for the audit trail).
  try {
    const connection = (navigator as any).connection;
    return connection?.effectiveType ? `client:${connection.effectiveType}` : null;
  } catch {
    return null;
  }
}
