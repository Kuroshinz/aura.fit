'use client'

import { useEffect, useState } from 'react'

interface Snowflake {
  id: number
  x: number
  size: number
  opacity: number
  duration: number
  delay: number
  blur: number
  color: string
}

const SNOW_COLORS = [
  'rgba(255, 255, 255, 0.95)',
  'rgba(251, 191, 36, 0.9)', // Gold Dust
  'rgba(165, 180, 252, 0.9)', // Indigo Dust
  'rgba(56, 189, 248, 0.9)', // Cyan Dust
  'rgba(192, 132, 252, 0.9)', // Purple Dust
]

export function SnowEffect() {
  const [flakes, setFlakes] = useState<Snowflake[]>([])

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const flakeCount = isMobile ? 12 : 35; // Reduce drastically for mobile performance
    
    const generatedFlakes: Snowflake[] = Array.from({ length: flakeCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * (isMobile ? 4 : 7) + 2, // Smaller on mobile
      opacity: Math.random() * 0.6 + 0.1, // Less bright
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 10,
      blur: isMobile ? 0 : Math.random() * 2, // Disable blur on mobile for performance
      color: SNOW_COLORS[Math.floor(Math.random() * SNOW_COLORS.length)],
    }))
    setFlakes(generatedFlakes)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full animate-snow-fall"
          style={{
            left: `${flake.x}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            backgroundColor: flake.color,
            opacity: flake.opacity,
            filter: `blur(${flake.blur}px)`,
            boxShadow: `0 0 ${flake.size * 3}px ${flake.color}`,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
