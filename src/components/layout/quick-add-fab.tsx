'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Dumbbell, ListPlus, Edit3, Repeat } from 'lucide-react'

export function QuickAddFAB() {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { id: 'replace', label: 'Thay Đổi Bài', icon: Repeat },
    { id: 'note', label: 'Thêm Ghi Chú', icon: Edit3 },
    { id: 'set', label: 'Thêm Set', icon: ListPlus },
    { id: 'exercise', label: 'Thêm Bài Tập', icon: Dumbbell },
  ]

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3 lg:bottom-12 lg:right-12">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="flex flex-col gap-3"
          >
            {actions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                  className="flex items-center gap-3 bg-[#070714] border border-slate-700 text-white px-4 py-2 rounded-xl shadow-xl hover:bg-slate-800 transition-colors"
                  onClick={() => {
                    console.log(`Triggered ${action.id}`);
                    setIsOpen(false);
                  }}
                >
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">{action.label}</span>
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700">
                    <Icon className="w-4 h-4 text-amber-400" />
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] z-50 border border-amber-300"
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>
          <Plus className="w-6 h-6 stroke-[3]" />
        </motion.div>
      </motion.button>
    </div>
  )
}
