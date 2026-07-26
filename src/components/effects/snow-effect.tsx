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
    const generatedFlakes: Snowflake[] = Array.from({ length: 55 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 7 + 2,
      opacity: Math.random() * 0.8 + 0.2,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 10,
      blur: Math.random() * 2,
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
