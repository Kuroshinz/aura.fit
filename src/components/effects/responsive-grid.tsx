'use client'

import { type ReactNode, type HTMLAttributes } from 'react'

interface ResponsiveGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const gapMap = {
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4 sm:gap-5',
  lg: 'gap-5 sm:gap-6 lg:gap-8',
  xl: 'gap-6 sm:gap-8 lg:gap-10',
}

/**
 * Responsive grid that auto-adjusts columns at each breakpoint.
 * Defaults: 1 col on mobile → 2 on sm → 3 on md → 4 on lg.
 */
export function ResponsiveGrid({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className = '',
  ...props
}: ResponsiveGridProps) {
  const colClasses = [
    cols.xs ? `grid-cols-${cols.xs}` : '',
    cols.sm ? `sm:grid-cols-${cols.sm}` : '',
    cols.md ? `md:grid-cols-${cols.md}` : '',
    cols.lg ? `lg:grid-cols-${cols.lg}` : '',
    cols.xl ? `xl:grid-cols-${cols.xl}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={`grid ${colClasses} ${gapMap[gap]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Two-column responsive layout (sidebar + main content).
 * Switches to single column on mobile.
 */
export function TwoColumnLayout({
  sidebar,
  children,
  sidebarWidth = 'md',
  className = '',
}: {
  sidebar: ReactNode
  children: ReactNode
  sidebarWidth?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sidebarGridMap = {
    sm: 'lg:grid-cols-[280px_1fr]',
    md: 'lg:grid-cols-[320px_1fr]',
    lg: 'lg:grid-cols-[380px_1fr]',
  }

  return (
    <div
      className={`grid grid-cols-1 ${sidebarGridMap[sidebarWidth]} gap-6 ${className}`}
    >
      <aside className="w-full">{sidebar}</aside>
      <main className="min-w-0">{children}</main>
    </div>
  )
}
