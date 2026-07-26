import { ResponsiveNav } from '@/components/layout/responsive-nav'
import { RestTimer } from '@/components/workout/rest-timer'
import { SnowEffect } from '@/components/effects/snow-effect'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#030308] text-slate-100 relative overflow-x-hidden">
      {/* Interactive Glowing Snow Effect */}
      <SnowEffect />

      <ResponsiveNav />
      {/* Fix Sidebar Overlap Spacing with md:pl-64 */}
      <main className="flex-1 md:pl-64 p-4 md:p-8 pb-28 md:pb-8 max-w-7xl mx-auto w-full relative z-20">
        {children}
      </main>
      <RestTimer />
    </div>
  )
}
