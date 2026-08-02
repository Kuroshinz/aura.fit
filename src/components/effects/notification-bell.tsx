'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, CheckCheck, Trash2, Trophy, Flame, TrendingUp, Clock, AlertCircle } from 'lucide-react'

interface InAppNotification {
  id: string
  type: 'achievement' | 'streak' | 'pr' | 'reminder'
  title: string
  message: string
  read: boolean
  createdAt: string
}

const NOTIFICATIONS_KEY = 'aura_notifications'

const typeConfig = {
  achievement: {
    label: 'THÀNH TÍCH',
    icon: Trophy,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  pr: {
    label: 'PR',
    icon: TrendingUp,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  streak: {
    label: 'STREAK',
    icon: Flame,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-400',
  },
  reminder: {
    label: 'NHẮC',
    icon: Clock,
    color: 'text-slate-400',
    bg: 'bg-slate-700/30',
    border: 'border-slate-600/30',
    dot: 'bg-slate-400',
  },
}

export function getStoredNotifications(): InAppNotification[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addNotification(notif: Omit<InAppNotification, 'id' | 'read' | 'createdAt'>) {
  const list = getStoredNotifications()
  const newNotif: InAppNotification = {
    ...notif,
    id: `notif-${Date.now()}`,
    read: false,
    createdAt: new Date().toISOString(),
  }
  const updated = [newNotif, ...list].slice(0, 50)
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
  return newNotif
}

export function markAllAsRead() {
  const list = getStoredNotifications()
  const updated = list.map(n => ({ ...n, read: true }))
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
}

export function clearNotifications() {
  localStorage.removeItem(NOTIFICATIONS_KEY)
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setNotifications(getStoredNotifications())
    const interval = setInterval(() => {
      setNotifications(getStoredNotifications())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative flex justify-center w-full" ref={bellRef}>
      {/* Bell Button — sleek, compact */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-amber-400/40 hover:bg-slate-800/70 transition-all duration-200"
        aria-label="Thông báo"
      >
        <Bell className={`w-4 h-4 transition-colors duration-200 ${
          isOpen ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
        }`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-br from-amber-400 to-orange-500 text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 animate-pulse-subtle">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="absolute left-full bottom-0 ml-4 w-[340px] max-h-[460px] overflow-hidden z-50
              bg-slate-900/90 backdrop-blur-2xl
              rounded-2xl border border-slate-700/80 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.05)]
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-amber-500/30
              [&::-webkit-scrollbar-thumb]:rounded-full"
            style={{ transformOrigin: 'bottom left' }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-2xl border-b border-slate-700/60 px-5 py-3.5 flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/15">
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-sm font-bold text-white">Thông báo</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-[10px] font-mono font-bold text-amber-400">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => { markAllAsRead(); setNotifications(getStoredNotifications()) }}
                    className="p-1.5 rounded-lg hover:bg-cyan-500/15 text-cyan-400 transition-all"
                    title="Đã đọc tất cả"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => { clearNotifications(); setNotifications([]) }}
                  className="p-1.5 rounded-lg hover:bg-red-500/15 text-red-400 transition-all"
                  title="Xóa tất cả"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto max-h-[360px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <div className="p-3 rounded-2xl bg-slate-800/50 mb-3">
                    <Bell className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Chưa có thông báo</p>
                  <p className="text-[11px] text-slate-600 mt-1 font-mono">
                    Hoàn thành buổi tập để nhận thông báo đầu tiên
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/50">
                  {notifications.slice(0, 20).map((notif) => {
                    const config = typeConfig[notif.type]
                    const Icon = config.icon
                    return (
                      <div
                        key={notif.id}
                        className={`relative px-5 py-3.5 transition-all duration-150 hover:bg-slate-800/40 cursor-pointer ${
                          !notif.read ? 'bg-amber-500/[0.03]' : ''
                        }`}
                      >
                        {/* Unread indicator dot */}
                        {!notif.read && (
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                        )}

                        <div className="flex items-start gap-3">
                          {/* Icon badge */}
                          <div className={`shrink-0 p-2 rounded-xl ${config.bg} ${config.border} border`}>
                            <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-bold text-white truncate">{notif.title}</span>
                              <span className={`shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold ${config.bg} ${config.color}`}>
                                {config.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-slate-600 mt-1.5 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(notif.createdAt).toLocaleDateString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer hint */}
            {notifications.length > 0 && (
              <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-700/40 px-5 py-2.5 text-center">
                <span className="text-[10px] font-mono text-slate-600">
                  {notifications.length > 20 ? 'Hiển thị 20 thông báo gần nhất' : `${notifications.length} thông báo`}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
