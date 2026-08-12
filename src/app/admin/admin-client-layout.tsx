'use client'

import { AdminSidebar } from '@/modules/admin-shell/components/admin-sidebar';
import { ToastContainer } from '@/components/effects/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function AdminClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex font-sans selection:bg-amber-500/30">
      <AdminSidebar />
      <main className="flex-1 ml-64 min-w-0 bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.05),rgba(255,255,255,0))] relative">
        <AnimatePresence mode="wait">
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
        </AnimatePresence>
      </main>
      <ToastContainer />
    </div>
  );
}
