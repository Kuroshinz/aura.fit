'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { User, Calculator, ShieldAlert, Settings, LogOut, X } from 'lucide-react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
  isAdmin: boolean
}

export function MobileMenuDrawer({ isOpen, onClose, onLogout, isAdmin }: DrawerProps) {
  const menuItems = [
    { label: 'Hồ Sơ (Profile)', href: '/profile', icon: User },
    { label: 'Máy Tính (Calculator)', href: '/calculator', icon: Calculator },
    { label: 'Cài Đặt (Settings)', href: '/settings', icon: Settings },
  ]
  if (isAdmin) {
    menuItems.push({ label: 'Admin Panel', href: '/admin', icon: ShieldAlert })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-[#070714] border-t border-slate-800 rounded-t-3xl z-[70] lg:hidden pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
          >
            <div className="p-6 pb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-black text-white">Menu Mở Rộng</h3>
                <button onClick={onClose} className="p-2 bg-slate-900 rounded-full text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {menuItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-white font-bold hover:bg-slate-800 transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-amber-400" />
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => { onClose(); onLogout(); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold hover:bg-red-500/20 transition-colors mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  Đăng Xuất
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
