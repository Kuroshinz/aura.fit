'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Settings,
  MessageSquare,
  FileText,
  Activity,
  HardDrive,
  BarChart3,
  ShieldAlert,
  ListTodo
} from 'lucide-react';
import { useProfileStore } from '@/store/use-profile-store';
import { Role } from '@/lib/permissions/rbac';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, permission: 'view:analytics' },
  { href: '/admin/users', label: 'Users', icon: Users, permission: 'manage:users' },
  { href: '/admin/roles', label: 'Roles & Permissions', icon: ShieldAlert, permission: 'manage:roles' },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: ListTodo, permission: 'manage:subscriptions' },
  { href: '/admin/exercises', label: 'Exercises', icon: Dumbbell, permission: 'manage:exercises' },
  { href: '/admin/templates', label: 'Templates', icon: ListTodo, permission: 'manage:templates' },
  { href: '/admin/media', label: 'Media Manager', icon: HardDrive, permission: 'manage:media' },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare, permission: 'manage:feedback' },
  { href: '/admin/announcements', label: 'Announcements', icon: FileText, permission: 'manage:announcements' },
  { href: '/admin/audit', label: 'Audit Logs', icon: ShieldAlert, permission: 'view:audit_logs' },
  { href: '/admin/system', label: 'System Health', icon: Activity, permission: 'manage:settings' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, permission: 'manage:settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { profile } = useProfileStore();

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen fixed top-0 left-0 z-40">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-white tracking-tight">AURA.FIT <span className="text-amber-500 font-mono">ADMIN</span></span>
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
            {profile?.name?.substring(0, 2).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile?.name || 'Admin User'}</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest">{profile?.role || 'admin'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
