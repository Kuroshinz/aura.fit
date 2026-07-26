'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useProfileStore } from '@/store/use-profile-store'
import { LayoutDashboard, Calendar, Dumbbell, Play, Calculator, User, ShieldAlert, LogOut } from 'lucide-react'

const navItems = [
  { label: 'DASHBOARD', href: '/dashboard', icon: LayoutDashboard },
  { label: 'LỊCH TẬP', href: '/routines', icon: Calendar },
  { label: 'THƯ VIỆN', href: '/exercises', icon: Dumbbell },
  { label: 'MÁY TÍNH 1RM', href: '/calculator', icon: Calculator },
  { label: 'HỒ SƠ', href: '/profile', icon: User },
  { label: 'ADMIN PANEL', href: '/admin', icon: ShieldAlert },
]

export function ResponsiveNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, logout } = useProfileStore()

  return (
    <>
      {/* Desktop Sidebar Nav */}
      <aside className="hidden md:flex flex-col w-64 aura-glass min-h-screen p-6 border-r border-slate-700/80 fixed left-0 top-0 z-30">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-2xl btn-aura-gold flex items-center justify-center font-extrabold text-xl text-black shadow-lg">
            A
          </div>
          <span className="font-display font-black text-2xl tracking-tight gold-gradient-text">
            AURA.FIT
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems
            .filter((item) => item.href !== '/admin' || profile?.role === 'admin')
            .map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm tracking-wider transition-all ${
                    isActive
                      ? 'bg-amber-400 text-black font-extrabold shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
        </nav>

        {/* Live Session Quick Button & Logout */}
        <div className="pt-6 border-t border-slate-700/80 space-y-3">
          <Link
            href="/workout"
            className="w-full py-4 btn-aura-gold text-black font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-2xl"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>BUỔI TẬP HIỆN TẠI</span>
          </Link>

          <button
            onClick={() => {
              if (confirm('Bạn có chắc muốn đăng xuất tài khoản?')) {
                logout()
                router.push('/login')
              }
            }}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 border border-red-500/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>ĐĂNG XUẤT</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Glass Nav Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 aura-glass border-t border-slate-700/80 px-4 py-3 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-mono">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
