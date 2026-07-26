'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Play, LayoutDashboard, Dumbbell, Calculator, User, Command, X, Sparkles } from 'lucide-react'
import { useWorkoutStore } from '@/store/use-workout-store'

const actions = [
  { id: 'workout', label: 'Bắt đầu buổi tập mới', icon: Play, shortcut: 'W' },
  { id: 'dashboard', label: 'Dashboard & Analytics', icon: LayoutDashboard, shortcut: 'D' },
  { id: 'exercises', label: 'Thư viện bài tập', icon: Dumbbell, shortcut: 'E' },
  { id: 'calculator', label: 'Máy tính 1RM', icon: Calculator, shortcut: 'C' },
  { id: 'profile', label: 'Hồ sơ cá nhân', icon: User, shortcut: 'P' },
]

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const startWorkout = useWorkoutStore((state) => state.startWorkout)

  // Toggle on Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Filter actions based on search
  const filteredActions = actions.filter((action) =>
    action.label.toLowerCase().includes(search.toLowerCase())
  )

  // Handle keyboard navigation within the palette
  useEffect(() => {
    if (!isOpen) return
    const handleNav = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredActions.length)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length)
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredActions[selectedIndex]) {
          executeAction(filteredActions[selectedIndex].id)
        }
      }
    }
    window.addEventListener('keydown', handleNav)
    return () => window.removeEventListener('keydown', handleNav)
  }, [isOpen, filteredActions, selectedIndex])

  const executeAction = (id: string) => {
    setIsOpen(false)
    switch (id) {
      case 'workout':
        startWorkout(undefined, 'Buổi tập nhanh (Cmd+K)')
        router.push('/workout')
        break
      case 'dashboard':
        router.push('/dashboard')
        break
      case 'exercises':
        router.push('/exercises')
        break
      case 'calculator':
        router.push('/calculator')
        break
      case 'profile':
        router.push('/profile')
        break
    }
  }

  return (
    <>
      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-40 right-4 z-40 p-3.5 rounded-full btn-aura-gold text-black shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label="Open Command Palette"
      >
        <Command className="w-6 h-6" />
      </button>

      {/* Modal Backdrop & Content */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 sm:px-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Palette Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-lg relative bg-slate-900/80 backdrop-blur-3xl border border-amber-500/30 rounded-3xl shadow-[0_0_50px_rgba(251,191,36,0.15)] overflow-hidden flex flex-col"
            >
              {/* Search Header */}
              <div className="flex items-center px-4 py-4 border-b border-slate-700/50 gap-3">
                <Search className="w-5 h-5 text-amber-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Gõ lệnh hoặc tìm kiếm..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setSelectedIndex(0)
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-white font-mono text-lg placeholder:text-slate-500"
                />
                <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-400 border border-slate-700 px-2 py-1 rounded-md">
                  <span>ESC</span>
                </div>
              </div>

              {/* Action List */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filteredActions.length > 0 ? (
                  filteredActions.map((action, idx) => {
                    const Icon = action.icon
                    const isSelected = idx === selectedIndex

                    return (
                      <button
                        key={action.id}
                        onClick={() => executeAction(action.id)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`
                          w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 text-left
                          ${isSelected ? 'bg-amber-400/10 border border-amber-400/30' : 'border border-transparent hover:bg-slate-800/50'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-slate-800 text-slate-400'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`font-bold font-mono ${isSelected ? 'text-amber-300' : 'text-slate-300'}`}>
                            {action.label}
                          </span>
                        </div>
                        {action.shortcut && (
                          <span className="hidden sm:block text-[10px] font-mono font-bold text-slate-500 border border-slate-700/80 px-2 py-1 rounded bg-slate-900/50">
                            {action.shortcut}
                          </span>
                        )}
                      </button>
                    )
                  })
                ) : (
                  <div className="py-12 text-center text-slate-500 font-mono text-sm">
                    Không tìm thấy lệnh nào phù hợp.
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="px-4 py-3 bg-black/40 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><kbd className="bg-slate-800 px-1 rounded">↑</kbd> <kbd className="bg-slate-800 px-1 rounded">↓</kbd> Điều hướng</span>
                  <span className="flex items-center gap-1"><kbd className="bg-slate-800 px-1 rounded">↵</kbd> Chọn</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500/50">
                  <Sparkles className="w-3 h-3" /> Agent UI
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
