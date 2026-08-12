import { Metadata } from 'next';
import { AdminClientLayout } from './admin-client-layout';

export const metadata: Metadata = {
  title: 'AURA.FIT Enterprise Admin',
  description: 'Enterprise control center for AURA.FIT',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
