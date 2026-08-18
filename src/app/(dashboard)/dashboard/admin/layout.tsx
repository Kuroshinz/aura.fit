'use client';

import { AdminSidebar } from '@/modules/admin-shell/components/admin-sidebar';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';
import { ShieldX } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * Layout cho Admin Panel nhúng trong AURA.FIT.
 * - Sidebar admin cố định bên trái
 * - Chỉ admin (role = admin/owner) mới vào được — qua PermissionGuard
 */
export default function DashboardAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <PermissionGuard
      permission="view:analytics"
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#030308]">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
              <ShieldX className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">ACCESS DENIED</h1>
            <p className="text-slate-400 text-sm">
              Khu vực quản trị chỉ dành cho admin. Liên hệ quản trị viên nếu bạn cần quyền truy cập.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-[#030308] text-slate-50 flex font-sans selection:bg-amber-500/30">
        <AdminSidebar />
        <main className="flex-1 ml-64 min-w-0 bg-[#030308] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.05),rgba(255,255,255,0))] relative">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto p-6 md:p-10"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </PermissionGuard>
  );
}
