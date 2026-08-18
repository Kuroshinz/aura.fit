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
  ShieldCheck
} from 'lucide-react';
import { useProfileStore } from '@/store/use-profile-store';
import { Role } from '@/lib/permissions/rbac';
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
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen fixed top-0 left-0 z-40">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-white tracking-tight">NEXUS <span className="text-amber-500 font-mono">ADMIN</span></span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {ADMIN_LINKS.map((link) => {
          const content = (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/admin')
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
              {pathname === link.href && (
                <motion.div
                  layoutId="admin-sidebar-active"
                  className="absolute left-0 w-1 h-8 bg-amber-500 rounded-r-full"
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

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
            {profile?.name?.substring(0, 2).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile?.name || 'Admin User'}</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest">{profile?.role || 'admin'}</p>
          </div>
        </div>
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
          className="w-full py-2 bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-sm font-bold rounded-lg transition-colors border border-transparent hover:border-red-500/20"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
