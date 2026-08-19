'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  BarChart3,
  ShieldAlert,
  ListTodo,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { useProfileStore } from '@/store/use-profile-store';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';

const ADMIN_LINKS = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3, permission: 'view:analytics' },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users, permission: 'manage:users' },
  { href: '/dashboard/admin/roles', label: 'Roles & Permissions', icon: ShieldAlert, permission: 'manage:roles' },
  { href: '/dashboard/admin/subscriptions', label: 'Subscriptions', icon: ListTodo, permission: 'manage:subscriptions' },
  { href: '/dashboard/admin/exercises', label: 'Exercises', icon: Dumbbell, permission: 'manage:exercises' },
  { href: '/dashboard/admin/templates', label: 'Templates', icon: ListTodo, permission: 'manage:templates' },
  { href: '/dashboard/admin/security', label: 'Security Logs', icon: ShieldCheck, permission: 'view:audit_logs' },
  { href: '/dashboard/admin/threats', label: 'Threat Monitor', icon: ShieldAlert, permission: 'view:audit_logs' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { profile } = useProfileStore();

  return (
    <aside className="w-64 bg-[#030308]/90 backdrop-blur-2xl border-r border-white/10 flex flex-col h-screen fixed top-0 left-0 z-40 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
      {/* Logo — AURA F.I.T aurora style */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <Link href="/dashboard/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg btn-aura-gold flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-white tracking-tight">
            NEXUS <span className="gold-gradient-text font-mono">ADMIN</span>
          </span>
        </Link>
      </div>

      {/* Nav items — amber active, like AURA.FIT sidebar */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {ADMIN_LINKS.map((link) => {
          const active = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/dashboard/admin');
          const content = (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                active
                  ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <link.icon className={`w-4 h-4 shrink-0 ${active ? 'text-amber-400' : 'text-amber-400/60'}`} />
              {link.label}
              {active && (
                <motion.div
                  layoutId="admin-sidebar-active"
                  className="absolute left-0 w-1 h-8 bg-amber-500 rounded-r-full shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );

          if (link.permission) {
            return (
              <PermissionGuard key={link.href} permission={link.permission}>
                {content}
              </PermissionGuard>
            );
          }
          return content;
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full btn-aura-gold flex items-center justify-center text-black font-black">
            {profile?.name?.substring(0, 2).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{profile?.name || 'Admin User'}</p>
            <p className="text-xs text-amber-400/80 uppercase tracking-widest">{profile?.role || 'admin'}</p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="w-full py-2 mb-2 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-sm font-bold rounded-xl transition-all border border-amber-400/30 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại AURA.FIT
        </Link>
        <button
          onClick={async () => {
            const { logout } = useProfileStore.getState();
            logout();
            try {
              const { createClient } = await import('@/lib/supabase/client');
              const supabase = createClient();
              await supabase.auth.signOut();
            } catch { /* ignore */ }
            window.location.href = '/login';
          }}
          className="w-full py-2 bg-white/5 hover:bg-red-500/15 text-slate-400 hover:text-red-400 text-sm font-bold rounded-xl transition-all border border-transparent hover:border-red-500/30"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
