'use client'

import { type HTMLAttributes } from 'react'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'chart' | 'avatar' | 'circle'
  width?: string
  height?: string
}

function SkeletonBase({ className = '', ...props }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-800/60 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent ${className}`}
      {...props}
    />
  )
}

export function Skeleton({ variant = 'text', width, height, className = '', ...rest }: SkeletonProps) {
  switch (variant) {
    case 'text':
      return (
        <SkeletonBase
          className={`h-4 w-full ${className}`}
          style={{ width, height: height || '1rem' }}
          {...rest}
        />
      )

    case 'card':
      return (
        <SkeletonBase
          className={`rounded-3xl ${className}`}
          style={{ width: width || '100%', height: height || '200px' }}
          {...rest}
        />
      )

    case 'chart':
      return (
        <SkeletonBase
          className={`rounded-2xl ${className}`}
          style={{ width: width || '100%', height: height || '250px' }}
          {...rest}
        />
      )

    case 'avatar':
    case 'circle':
      return (
        <SkeletonBase
          className={`rounded-full shrink-0 ${className}`}
          style={{ width: width || '48px', height: height || '48px' }}
          {...rest}
        />
      )

    default:
      return (
        <SkeletonBase
          className={className}
          style={{ width, height }}
          {...rest}
        />
      )
  }
}

// ─── Compound skeleton components for common patterns ───────────────

export function StatsCardSkeleton() {
  return (
    <div className="aura-glass rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="circle" width="40px" height="40px" />
      </div>
      <Skeleton variant="text" width="80%" height="2rem" />
      <Skeleton variant="text" width="40%" />
    </div>
  )
}

export function ChartCardSkeleton() {
  return (
    <div className="aura-glass rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="text" width="80px" />
      </div>
      <Skeleton variant="chart" height="200px" />
    </div>
  )
}

export function ExerciseCardSkeleton() {
  return (
    <div className="aura-glass rounded-3xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" width="40px" height="40px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
    </div>
  )
}

export function ProfileCardSkeleton() {
  return (
    <div className="aura-glass rounded-3xl p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="avatar" width="64px" height="64px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="50%" height="1.5rem" />
          <Skeleton variant="text" width="30%" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton variant="card" height="80px" />
        <Skeleton variant="card" height="80px" />
        <Skeleton variant="card" height="80px" />
      </div>
    </div>
  )
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="aura-glass rounded-2xl p-4 flex items-center gap-4">
          <Skeleton variant="circle" width="36px" height="36px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </div>
          <Skeleton variant="text" width="60px" />
        </div>
      ))}
    </div>
  )
}
