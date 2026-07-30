'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

export function InstallPWAPrompt() {
  const [isReady, setIsReady] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIosDevice)

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsReady(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Show prompt on iOS after a short delay
    if (isIosDevice && !(window.navigator as any).standalone) {
      setTimeout(() => setIsReady(true), 3000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsReady(false)
    }
    setDeferredPrompt(null)
  }

  return (
    <AnimatePresence>
      {isReady && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[#070714] border border-amber-500/30 p-4 rounded-2xl shadow-2xl z-50 overflow-hidden"
        >
          {/* Subtle glow background */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <Download className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-display font-bold text-sm">Cài đặt Ứng dụng</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                {isIOS 
                  ? 'Nhấn nút Share (Chia sẻ) dưới thanh công cụ Safari và chọn "Thêm vào MH chính" để có trải nghiệm tốt nhất.' 
                  : 'Cài đặt AURA.FIT vào máy để sử dụng mượt mà không cần mạng.'}
              </p>
              
              {!isIOS && (
                <div className="mt-3 flex gap-2">
                  <button 
                    onClick={handleInstallClick}
                    className="flex-1 py-2 px-3 bg-amber-400 text-black font-bold text-xs rounded-xl hover:bg-amber-500 transition-colors"
                  >
                    Cài Đặt Ngay
                  </button>
                  <button 
                    onClick={() => setIsReady(false)}
                    className="py-2 px-3 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Bỏ Qua
                  </button>
                </div>
              )}
            </div>
            
            {isIOS && (
              <button onClick={() => setIsReady(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
