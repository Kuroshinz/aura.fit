'use client'

import { useState, useEffect } from 'react'
import { ResponsiveNav } from '@/components/layout/responsive-nav'
import { CommandPalette } from '@/components/layout/command-palette'
import { RestTimer } from '@/components/workout/rest-timer'
import { SnowEffect } from '@/components/effects/snow-effect'
import { PageTransition } from '@/components/effects/page-transition'
import { ToastContainer } from '@/components/effects/toast'
import { ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex min-h-screen bg-transparent text-slate-100 relative overflow-x-hidden">
      {/* Interactive Glowing Snow Effect */}
      <SnowEffect />

      <ResponsiveNav />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 p-3 lg:p-8 pb-32 md:pb-8 w-full relative z-20 overflow-x-hidden">
        <PageTransition>
          {children}
        </PageTransition>
      </main>

      <RestTimer />

      <CommandPalette />

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-40 p-3.5 rounded-2xl aura-glass border-amber-400/50 text-amber-400 shadow-2xl hover:bg-amber-400/20 transition-all touch-target"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

