'use client'

import {
  LayoutDashboard, Calendar, Dumbbell, Calculator,
  User, Trophy
} from 'lucide-react'

/**
 * Single source of truth for ALL navigation items.
 * Used by: Desktop Sidebar (PC), Mobile Bottom Tab Bar, Mobile Menu Drawer.
 * Keeping one config ensures PC and Mobile are always in sync.
 * NOTE: Admin Panel is intentionally NOT listed here — it lives on the
 * standalone NEXUS ADMIN website (see NEXT_PUBLIC_ADMIN_URL).
 */
export const NAV_ITEMS = [
  { label: 'DASHBOARD', href: '/dashboard', icon: LayoutDashboard, shortcut: 'G D' },
  { label: 'LỊCH TẬP', href: '/routines', icon: Calendar, shortcut: 'G R' },
  { label: 'THƯ VIỆN', href: '/exercises', icon: Dumbbell, shortcut: 'G E' },
  { label: 'MÁY TÍNH 1RM', href: '/calculator', icon: Calculator, shortcut: 'G C' },
  { label: 'KỶ LỤC', href: '/records', icon: Trophy, shortcut: 'G K' },
  { label: 'HỒ SƠ', href: '/profile', icon: User, shortcut: 'G P' },
]

/** Which routes show in the compact mobile bottom tab bar (max 5). */
export const MOBILE_TAB_HREFS = ['/dashboard', '/routines', '/exercises', '/records']
