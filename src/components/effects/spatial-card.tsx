'use client'

import React, { useState, useRef, useEffect } from 'react'

interface SpatialCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number
  glare?: boolean
}

export function SpatialCard({ children, className = '', intensity = 12, glare = true }: SpatialCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })
  const [isTouching, setIsTouching] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleTilt = (clientX: number, clientY: number) => {
    if (prefersReducedMotion) return
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const mouseX = clientX - centerX
    const mouseY = clientY - centerY

    const rX = (-mouseY / (rect.height / 2)) * intensity
    const rY = (mouseX / (rect.width / 2)) * intensity

    setRotateX(rX)
    setRotateY(rY)

    // Glare follows pointer
    if (glare) {
      const gX = ((clientX - rect.left) / rect.width) * 100
      const gY = ((clientY - rect.top) / rect.height) * 100
      setGlarePos({ x: gX, y: gY })
    }
  }

  // Mouse Events
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleTilt(e.clientX, e.clientY)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
    setGlarePos({ x: 50, y: 50 })
  }

  // Touch Events for Mobile
  const handleTouchStart = () => setIsTouching(true)
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isTouching) {
      const touch = e.touches[0]
      handleTilt(touch.clientX, touch.clientY)
    }
  }
  const handleTouchEnd = () => {
    setIsTouching(false)
    setRotateX(0)
    setRotateY(0)
    setGlarePos({ x: 50, y: 50 })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
      className="w-full"
    >
      <div
        style={{
          transform: prefersReducedMotion ? 'none' : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: isTouching ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`aura-glass hologram-border relative z-10 overflow-hidden ${className}`}
      >
        {children}

        {/* Glare/Reflection Overlay */}
        {glare && !prefersReducedMotion && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
              opacity: rotateX !== 0 || rotateY !== 0 ? 1 : 0,
            }}
          />
        )}
      </div>
    </div>
  )
}
