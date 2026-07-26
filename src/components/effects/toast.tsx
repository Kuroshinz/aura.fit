'use client'

import { create } from 'zustand'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────────────────
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  variant: ToastVariant
  title: string
  message?: string
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearAll: () => void
}

// ─── Store ───────────────────────────────────────────────────────────
export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))
    return id
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearAll: () => set({ toasts: [] }),
}))

// ─── Auto-dismiss helper ────────────────────────────────────────────
const variantConfig: Record<ToastVariant, { icon: typeof CheckCircle; color: string; border: string }> = {
  success: { icon: CheckCircle, color: 'text-emerald-400', border: 'border-emerald-500/40' },
  error: { icon: AlertCircle, color: 'text-red-400', border: 'border-red-500/40' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', border: 'border-amber-500/40' },
  info: { icon: Info, color: 'text-cyan-400', border: 'border-cyan-500/40' },
}

// ─── Convenience hooks ──────────────────────────────────────────────
export function useToast() {
  const addToast = useToastStore((s) => s.addToast)
  const removeToast = useToastStore((s) => s.removeToast)

  const toast = useCallback(
    (variant: ToastVariant, title: string, message?: string, duration = 4000) => {
      return addToast({ variant, title, message, duration })
    },
    [addToast]
  )

  return { toast, dismiss: removeToast }
}

// ─── Single Toast Item ──────────────────────────────────────────────
function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((s) => s.removeToast)
  const [isExiting, setIsExiting] = useState(false)

  const config = variantConfig[toast.variant]
  const Icon = config.icon

  useEffect(() => {
    const duration = toast.duration ?? 4000
    if (duration <= 0) return

    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => removeToast(toast.id), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.duration, toast.id, removeToast])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => removeToast(toast.id), 300)
  }

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 p-4 rounded-2xl border bg-[#0c0e1e]/95 backdrop-blur-xl
        shadow-2xl min-w-[280px] max-w-[420px] pointer-events-auto
        transition-all duration-300 ease-out
        ${config.border}
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{toast.title}</p>
        {toast.message && (
          <p className="text-xs font-mono text-slate-400 mt-0.5 line-clamp-2">{toast.message}</p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors touch-target"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-slate-400" />
      </button>
    </div>
  )
}

// ─── Toast Container ────────────────────────────────────────────────
export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
