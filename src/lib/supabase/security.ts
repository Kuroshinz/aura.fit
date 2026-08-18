import { createClient } from './client';

/** Max login/register attempts allowed per IP within the window. */
export const MAX_ATTEMPTS_PER_IP = 3;
/** Lockout duration after exceeding attempts (milliseconds). */
export const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

/** Best-effort client IP (real IP detection happens server-side). */
export function getClientIp(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    const stored = localStorage.getItem('nexus_client_ip');
    if (stored) return stored;
  } catch { /* ignore */ }
  return 'client-unknown';
}

/** Record an attempt (login/register) for the current IP. Returns whether blocked. */
export async function recordAttempt(action: 'login' | 'register', email?: string): Promise<{
  allowed: boolean;
  remaining: number;
  blockedUntil: string | null;
}> {
  const supabase = createClient();
  const ip = getClientIp();

  const { data, error } = await supabase
    .from('auth_attempts')
    .select('*')
    .eq('ip_address', ip)
    .eq('action', action)
    .maybeSingle();

  if (error) return { allowed: true, remaining: MAX_ATTEMPTS_PER_IP, blockedUntil: null };

  if (!data) {
    await supabase.from('auth_attempts').insert({
      ip_address: ip,
      action,
      email: email || null,
      attempts: 1,
    });
    return { allowed: true, remaining: MAX_ATTEMPTS_PER_IP - 1, blockedUntil: null };
  }

  if (data.blocked_until && new Date(data.blocked_until) > new Date()) {
    return { allowed: false, remaining: 0, blockedUntil: data.blocked_until };
  }

  if (data.blocked_until && new Date(data.blocked_until) <= new Date()) {
    await supabase.from('auth_attempts').update({ attempts: 1, blocked_until: null, window_start: new Date().toISOString() })
      .eq('id', data.id);
    return { allowed: true, remaining: MAX_ATTEMPTS_PER_IP - 1, blockedUntil: null };
  }

  const next = data.attempts + 1;
  if (next >= MAX_ATTEMPTS_PER_IP) {
    const blockedUntil = new Date(Date.now() + LOCKOUT_MS).toISOString();
    await supabase.from('auth_attempts').update({ attempts: next, blocked_until: blockedUntil })
      .eq('id', data.id);
    return { allowed: false, remaining: 0, blockedUntil };
  }

  await supabase.from('auth_attempts').update({ attempts: next })
    .eq('id', data.id);
  return { allowed: true, remaining: MAX_ATTEMPTS_PER_IP - next, blockedUntil: null };
}

/** Clear attempts for this IP (on successful login). */
export async function clearAttempts(action: 'login' | 'register'): Promise<void> {
  const supabase = createClient();
  const ip = getClientIp();
  await supabase.from('auth_attempts').delete().eq('ip_address', ip).eq('action', action);
}

/** Check if an email or IP is banned. */
export async function isBanned(email?: string): Promise<{ banned: boolean; reason?: string }> {
  const supabase = createClient();
  const ip = getClientIp();

  if (email) {
    const { data } = await supabase
      .from('banned_users')
      .select('reason')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (data) return { banned: true, reason: data.reason || 'Banned' };
  }

  const { data: ipBan } = await supabase
    .from('banned_users')
    .select('reason')
    .eq('ip_address', ip)
    .maybeSingle();
  if (ipBan) return { banned: true, reason: ipBan.reason || 'Banned' };

  return { banned: false };
}

/** Format remaining lockout time for display. */
export function formatLockout(untilIso: string): string {
  const diff = new Date(untilIso).getTime() - Date.now();
  if (diff <= 0) return '0:00';
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
