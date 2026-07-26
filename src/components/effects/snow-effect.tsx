'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Snowflake {
  x: number
  y: number
  size: number
  opacity: number
  speedY: number
  speedX: number
  drift: number
  blur: number
  color: string
  pulse: number
}

const SNOW_COLORS = [
  'rgba(255, 255, 255, 0.95)',
  'rgba(251, 191, 36, 0.9)',
  'rgba(165, 180, 252, 0.9)',
  'rgba(56, 189, 248, 0.9)',
  'rgba(192, 132, 252, 0.9)',
]

const FLAKE_COUNT_DESKTOP = 30
const FLAKE_COUNT_MOBILE = 10

export function SnowEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const flakesRef = useRef<Snowflake[]>([])
  const animFrameRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const reducedMotionRef = useRef(false)

  const initFlakes = useCallback((width: number, height: number) => {
    const isMobile = width < 768
    const count = isMobile ? FLAKE_COUNT_MOBILE : FLAKE_COUNT_DESKTOP

    flakesRef.current = Array.from({ length: count }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * (isMobile ? 3 : 5) + 1.5,
      opacity: Math.random() * 0.4 + 0.05,
      speedY: Math.random() * 0.3 + 0.1,
      speedX: Math.random() * 0.15 - 0.075,
      drift: Math.random() * 0.3,
      blur: isMobile ? 0 : Math.random() * 1.5,
      color: SNOW_COLORS[Math.floor(Math.random() * SNOW_COLORS.length)],
      pulse: Math.random() * Math.PI * 2,
    }))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = mq.matches
    const handler = (e: MediaQueryListEvent) => { reducedMotionRef.current = e.matches }
    mq.addEventListener('change', handler)

    const resize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initFlakes(canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    // Mouse interaction
    const mouseHandler = (e: MouseEvent | TouchEvent) => {
      const x = 'touches' in e ? e.touches[0]?.clientX : (e as MouseEvent).clientX
      const y = 'touches' in e ? e.touches[0]?.clientY : (e as MouseEvent).clientY
      if (x != null && y != null) {
        mouseRef.current.x = x / window.innerWidth
        mouseRef.current.y = y / window.innerHeight
      }
    }
    window.addEventListener('mousemove', mouseHandler)
    window.addEventListener('touchmove', mouseHandler, { passive: true })

    let lastTime = 0
    const animate = (time: number) => {
      if (reducedMotionRef.current) {
        animFrameRef.current = requestAnimationFrame(animate)
        return
      }

      const dt = Math.min((time - lastTime) / 16.67, 3) // cap delta time
      lastTime = time

      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const mouseInfluenceX = (mouseRef.current.x - 0.5) * 0.3
      const mouseInfluenceY = (mouseRef.current.y - 0.5) * 0.3

      for (const flake of flakesRef.current) {
        flake.pulse += 0.01
        const wobble = Math.sin(flake.pulse) * flake.drift

        flake.x += flake.speedX * dt + wobble + mouseInfluenceX * 0.3
        flake.y += flake.speedY * dt + mouseInfluenceY * 0.2

        // Wrap around
        if (flake.y > canvas.height + 10) {
          flake.y = -10
          flake.x = Math.random() * canvas.width
        }
        if (flake.x < -10) flake.x = canvas.width + 10
        if (flake.x > canvas.width + 10) flake.x = -10

        // Draw
        ctx.beginPath()
        ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2)
        ctx.fillStyle = flake.color
        ctx.globalAlpha = flake.opacity
        if (flake.blur > 0) {
          ctx.filter = `blur(${flake.blur}px)`
        }
        ctx.fill()

        // Glow
        const glow = ctx.createRadialGradient(flake.x, flake.y, 0, flake.x, flake.y, flake.size * 3)
        glow.addColorStop(0, flake.color)
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow
        ctx.globalAlpha = flake.opacity * 0.3
        ctx.fill()
      }

      ctx.globalAlpha = 1
      ctx.filter = 'none'

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', mouseHandler)
      window.removeEventListener('touchmove', mouseHandler)
      mq.removeEventListener('change', handler)
    }
  }, [initFlakes])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      aria-hidden="true"
    />
  )
}
