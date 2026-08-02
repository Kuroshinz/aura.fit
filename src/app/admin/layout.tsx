import { AdminSidebar } from '@/modules/admin-shell/components/admin-sidebar';
import { ToastContainer } from '@/components/effects/toast';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AURA.FIT Enterprise Admin',
  description: 'Enterprise control center for AURA.FIT',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex font-sans selection:bg-amber-500/30">
      <AdminSidebar />
      <main className="flex-1 ml-64 min-w-0 bg-[#03030a]">
        <div className="max-w-7xl mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
