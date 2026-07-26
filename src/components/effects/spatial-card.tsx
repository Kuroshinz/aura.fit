'use client'

import React, { useState, useRef } from 'react'

interface SpatialCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number
}

export function SpatialCard({ children, className = '', intensity = 12 }: SpatialCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return // Disable 3D tilt on mobile for performance
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    const rX = (-mouseY / (rect.height / 2)) * intensity
    const rY = (mouseX / (rect.width / 2)) * intensity

    setRotateX(rX)
    setRotateY(rY)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
      className="w-full"
    >
      <div
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`aura-glass hologram-border relative z-10 ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
