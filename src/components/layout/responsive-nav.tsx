'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useProfileStore } from '@/store/use-profile-store'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Calendar, Dumbbell, Play, Calculator,
  User, ShieldAlert, LogOut, Menu, X, ChevronLeft, ChevronRight,
  Sparkles, Bell, Trophy, Menu as MenuIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { NotificationBell } from '@/components/effects/notification-bell'
import { MobileMenuDrawer } from './mobile-menu-drawer'

// ─── Navigation Items ──────────────────────────────────────────────
const navItems = [
  { label: 'DASHBOARD', href: '/dashboard', icon: LayoutDashboard, shortcut: 'G D' },
  { label: 'LỊCH TẬP', href: '/routines', icon: Calendar, shortcut: 'G R' },
  { label: 'THƯ VIỆN', href: '/exercises', icon: Dumbbell, shortcut: 'G E' },
  { label: 'MÁY TÍNH 1RM', href: '/calculator', icon: Calculator, shortcut: 'G C' },
  { label: 'KỶ LỤC', href: '/records', icon: Trophy, shortcut: 'G K' },
  { label: 'HỒ SƠ', href: '/profile', icon: User, shortcut: 'G P' },
  { label: 'ADMIN PANEL', href: '/dashboard/admin', icon: ShieldAlert, shortcut: 'G A', adminOnly: true },
]

// ─── Get initials from name ───────────────────────────────────────
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ─── Sidebar Item ─────────────────────────────────────────────────
function SidebarItem({
  item,
  isActive,
  collapsed,
}: {
  item: typeof navItems[number]
  isActive: boolean
  collapsed: boolean
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={`
        group relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm
        tracking-wider transition-all duration-200
        ${isActive
          ? 'bg-amber-400 text-black font-extrabold shadow-[0_0_20px_rgba(251,191,36,0.4)]'
          : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
        }
        ${collapsed ? 'justify-center px-0 mx-2' : ''}
        overflow-hidden
      `}
      title={collapsed ? item.label : undefined}
    >
      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-black' : 'text-amber-400'}`} />
      {!collapsed && <span>{item.label}</span>}

      {/* Tooltip on collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-mono font-bold rounded-xl border border-slate-700 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50">
          {item.label}
          <span className="ml-2 text-slate-500">{item.shortcut}</span>
        </div>
      )}
    </Link>
  )
}

// ─── Main Component ───────────────────────────────────────────────
export function ResponsiveNav() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { profile, setProfile, logout } = useProfileStore()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          if (payload.new && profile?.id === payload.new.id) {
            console.log('Realtime sync payload received:', payload.new)
            setProfile(payload.new as any)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id, setProfile])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close mobile nav on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setDrawerOpen(false)
  }, [pathname])

  const handleLogout = () => {
    if (typeof window !== 'undefined' && window.confirm('Bạn có chắc muốn đăng xuất tài khoản?')) {
      logout()
      router.push('/login')
    }
  }

  // Filter items for current user
  const isAdmin = profile?.role === 'admin' || profile?.role === 'owner'
  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  )

  // ─── DESKTOP SIDEBAR ──────────────────────────────────────────
  const sidebar = (
    <aside
      className={`
        hidden lg:flex flex-col min-h-screen border-r border-white/5 fixed left-0 top-0 z-30
        transition-all duration-300 ease-out
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Glass background container */}
      <div className="bg-black/20 backdrop-blur-3xl flex flex-col h-full overflow-hidden">
        {/* Logo & Toggle */}
        <div className={`
          flex items-center border-b border-white/5 py-5
          ${collapsed ? 'justify-center px-3' : 'justify-between px-6'}
        `}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl btn-aura-gold flex items-center justify-center font-extrabold text-xl text-black shadow-lg shrink-0">
                A
              </div>
              <span className="font-display font-black text-2xl tracking-tight gold-gradient-text truncate">
                AURA.FIT
              </span>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-2xl btn-aura-gold flex items-center justify-center font-extrabold text-xl text-black shadow-lg">
              A
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl hover:bg-slate-800 transition-colors text-slate-400 hover:text-white hidden xl:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User badge */}
        {!collapsed && profile && (
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-indigo-500 flex items-center justify-center text-xs font-black text-black">
              {getInitials(profile.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{profile.name}</p>
              <p className="text-[10px] font-mono text-slate-500 truncate">{profile.role === 'admin' ? 'Admin' : 'Athlete'}</p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 py-6 px-3 overflow-y-auto scrollbar-none">
          {visibleItems.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-white/5 p-3 space-y-2">
          {/* Live Session Button */}
          <Link
            href="/workout"
            className={`
              btn-aura-gold text-black font-black text-xs uppercase tracking-widest rounded-2xl
              flex items-center justify-center gap-2 shadow-2xl transition-all
              ${collapsed ? 'w-full py-3 px-2' : 'w-full py-4'}
            `}
            title="BUỔI TẬP HIỆN TẠI"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            {!collapsed && <span>BUỔI TẬP HIỆN TẠI</span>}
          </Link>

          {/* Notification Bell */}
          <div className="flex items-center justify-center w-full mb-2">
            <NotificationBell />
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`
              w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono font-bold
              text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2
              border border-red-500/30 transition-all
              ${collapsed ? 'px-2' : ''}
            `}
            title="ĐĂNG XUẤT"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>ĐĂNG XUẤT</span>}
          </button>
        </div>
      </div>
    </aside>
  )

  // ─── MOBILE BOTTOM TAB BAR ──────────────────────────────────
  const mobileBottomNav = (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      {/* Floating Workout Quick-Action Button */}
      <Link
        href="/workout"
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl btn-aura-gold text-black flex items-center justify-center shadow-2xl shadow-amber-500/30 z-10 hover:scale-105 active:scale-95 transition-transform"
        aria-label="Current Workout"
      >
        <Play className="w-6 h-6 fill-current" />
      </Link>

      {/* Tab Bar */}
      <div className="aura-glass border-t border-slate-700/80 px-2 py-2 flex justify-around items-center pt-8">
        {navItems.filter(item => ['/dashboard', '/routines', '/exercises', '/records'].includes(item.href)).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl
                transition-all duration-200
                min-w-[56px] min-h-[44px] flex items-center justify-center
                ${isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}
              `}
            >
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-dot"
                  className="absolute -top-2 w-6 h-0.5 rounded-full bg-amber-400"
                />
              )}

              <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]' : ''}`} />

              <span className="text-[9px] font-mono font-bold leading-tight max-w-[56px] truncate text-center">
                {item.label}
              </span>

              {/* Haptic-style feedback ripple */}
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-amber-400/5 -z-10" />
              )}
            </Link>
          )
        })}

        {/* Menu Drawer Toggle */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="relative flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl text-slate-400 hover:text-amber-400 min-w-[56px] min-h-[44px] flex items-center justify-center transition-all duration-200"
        >
          <MenuIcon className="w-5 h-5" />
          <span className="text-[9px] font-mono font-bold leading-tight mt-0.5">MENU</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {sidebar}
      {mobileBottomNav}

      <MobileMenuDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        onLogout={handleLogout} 
        isAdmin={profile?.role === 'admin'} 
      />

      {/* Spacer for mobile bottom nav */}
      <div className="lg:hidden h-20" />
    </>
  )
}
