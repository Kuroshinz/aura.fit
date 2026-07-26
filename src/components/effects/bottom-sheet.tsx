'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  snapPoints?: string[] // e.g., ['25%', '50%', '85%']
  defaultSnap?: number // index into snapPoints
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  snapPoints = ['50%'],
  defaultSnap = 0,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startY: number; currentY: number }>({ startY: 0, currentY: 0 })
  const [translateY, setTranslateY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [currentSnap, setCurrentSnap] = useState(defaultSnap)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setVisible(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setTimeout(() => setVisible(false), 300)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Get the current snap height in pixels
  const getSnapHeight = (snapIndex: number): number => {
    const percent = parseFloat(snapPoints[snapIndex]) / 100
    return window.innerHeight * percent
  }

  // Clamp translateY so sheet doesn't go above its target or below fully closed
  const clampTranslate = (y: number): number => {
    const maxTranslate = 0 // fully open at current snap
    const minTranslate = window.innerHeight * 0.95 // nearly closed
    return Math.max(maxTranslate, Math.min(minTranslate, y))
  }

  const handleDragStart = (clientY: number) => {
    dragRef.current.startY = clientY
    dragRef.current.currentY = 0
    setIsDragging(true)
  }

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return
    const delta = clientY - dragRef.current.startY
    dragRef.current.currentY = delta
    setTranslateY(clampTranslate(delta))
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    const delta = dragRef.current.currentY

    // If dragged down more than 30% of the sheet height, close
    const sheetHeight = sheetRef.current?.offsetHeight ?? 400
    if (delta > sheetHeight * 0.3) {
      onClose()
      setTranslateY(0)
      return
    }

    // Snap logic: determine which snap point is closest
    const currentAbsY = getSnapHeight(currentSnap) + delta
    let closestSnap = currentSnap
    let minDist = Infinity
    snapPoints.forEach((_, i) => {
      const snapAbsY = getSnapHeight(i)
      const dist = Math.abs(currentAbsY - snapAbsY)
      if (dist < minDist) {
        minDist = dist
        closestSnap = i
      }
    })

    setCurrentSnap(closestSnap)
    setTranslateY(0)
  }

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientY)
  const onTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleDragMove(e.touches[0].clientY)
    }
  }
  const onTouchEnd = () => handleDragEnd()

  // Mouse handlers (for desktop drag)
  const onMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY)
    const onMove = (ev: MouseEvent) => handleDragMove(ev.clientY)
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      handleDragEnd()
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  if (!visible) return null

  const sheetHeight = getSnapHeight(currentSnap)

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          open ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-[#0c0e1e] border border-slate-700/80
          rounded-t-3xl shadow-2xl
          transition-transform duration-300 ease-out
          ${open ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{
          height: `${sheetHeight}px`,
          maxHeight: '95vh',
          transform: isDragging
            ? `translateY(${translateY}px)`
            : open
            ? 'translateY(0)'
            : 'translateY(100%)',
          touchAction: 'none',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Bottom sheet'}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
        >
          <div className="w-10 h-1.5 rounded-full bg-slate-600" />
        </div>

        {/* Header */}
        {(title || true) && (
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700/80">
            <h3 className="text-lg font-bold text-white">{title || ''}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 transition-colors touch-target"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-56px)] px-6 py-4 safe-bottom">
          {children}
        </div>
      </div>
    </>
  )
}
