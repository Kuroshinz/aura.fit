'use client'

import { motion } from 'framer-motion'

export function DashboardSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between pb-2">
        <div className="space-y-3">
          <div className="h-4 w-48 bg-slate-800 rounded-full" />
          <div className="h-10 w-64 bg-slate-800 rounded-2xl" />
        </div>
        <div className="h-12 w-40 bg-slate-800 rounded-2xl" />
      </div>

      <div className="glow-divider" />

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 rounded-3xl bg-slate-900/30 border border-slate-800 space-y-4">
            <div className="flex justify-between">
              <div className="h-3 w-24 bg-slate-800 rounded-full" />
              <div className="h-10 w-10 bg-slate-800 rounded-2xl" />
            </div>
            <div className="h-8 w-32 bg-slate-800 rounded-xl" />
            <div className="h-3 w-36 bg-slate-800 rounded-full" />
          </div>
        ))}
      </div>

      {/* Chart skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-3xl bg-slate-900/20 border border-slate-800 p-6">
            <div className="h-4 w-40 bg-slate-800 rounded-full mb-6" />
            <div className="h-[200px] bg-slate-800/50 rounded-2xl" />
          </div>
        ))}
      </div>

      {/* History skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-8 rounded-3xl bg-slate-900/20 border border-slate-800">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-3 w-36 bg-slate-800 rounded-full" />
                <div className="h-5 w-48 bg-slate-800 rounded-lg" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-slate-800 rounded-xl" />
                <div className="h-8 w-24 bg-slate-800 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-slate-800 rounded-full" />
          <div className="h-10 w-48 bg-slate-800 rounded-2xl" />
        </div>
        <div className="flex gap-3">
          <div className="h-12 w-36 bg-slate-800 rounded-2xl" />
          <div className="h-12 w-28 bg-slate-800 rounded-2xl" />
        </div>
      </div>

      <div className="glow-divider" />

      {/* Profile card */}
      <div className="rounded-3xl bg-slate-900/20 border border-slate-800 p-10">
        <div className="flex gap-8">
          <div className="w-24 h-24 bg-slate-800 rounded-3xl shrink-0" />
          <div className="space-y-3 flex-1">
            <div className="h-8 w-56 bg-slate-800 rounded-xl" />
            <div className="h-4 w-80 bg-slate-800 rounded-full" />
            <div className="flex gap-2">
              <div className="h-8 w-32 bg-slate-800 rounded-xl" />
              <div className="h-8 w-32 bg-slate-800 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 rounded-3xl bg-slate-900/20 border border-slate-800">
            <div className="h-3 w-20 bg-slate-800 rounded-full mb-3" />
            <div className="h-8 w-24 bg-slate-800 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-3xl bg-slate-900/20 border border-slate-800 p-6 animate-pulse ${className}`}>
      <div className="h-3 w-24 bg-slate-800 rounded-full mb-3" />
      <div className="h-6 w-32 bg-slate-800 rounded-lg mb-2" />
      <div className="h-3 w-48 bg-slate-800 rounded-full" />
    </div>
  )
}
