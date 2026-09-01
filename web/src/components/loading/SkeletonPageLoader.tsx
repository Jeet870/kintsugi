import React from 'react'

/**
 * Lightweight, non-blocking Skeleton Fallback Component for React `<Suspense>`.
 * Displays progressive shimmer placeholders matching application layout boundaries,
 * keeping persistent headers and backgrounds visible during code splitting downloads.
 */
export const SkeletonPageLoader: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse select-none">
      {/* Hero Section Skeleton */}
      <div className="space-y-4 text-center max-w-3xl mx-auto pt-6">
        <div className="h-4 w-32 bg-zinc-800/80 rounded-full mx-auto" />
        <div className="h-10 sm:h-12 w-3/4 bg-zinc-800/90 rounded-lg mx-auto" />
        <div className="h-4 w-2/3 bg-zinc-800/60 rounded-md mx-auto" />
      </div>

      {/* 3-Card Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 rounded-lg border border-white/[0.06] bg-zinc-900/60 p-6 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800/80" />
              <div className="h-5 w-1/2 bg-zinc-800/90 rounded-md" />
              <div className="h-3.5 w-full bg-zinc-800/60 rounded-md" />
              <div className="h-3.5 w-4/5 bg-zinc-800/50 rounded-md" />
            </div>
            <div className="h-3 w-1/3 bg-zinc-800/70 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default SkeletonPageLoader
