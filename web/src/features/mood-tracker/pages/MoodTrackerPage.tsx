import React from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { HeartIcon, SparklesIcon, Calendar01Icon, ChartLineData01Icon } from '@hugeicons/core-free-icons'

import { MoodSelector } from '../components/MoodSelector'
import { AISupportMessageCard } from '../components/AISupportMessageCard'
import { MoodHistoryChart } from '../components/MoodHistoryChart'
import { MoodHistoryList } from '../components/MoodHistoryList'
import { useMoodHistory } from '../hooks/useMoodHistory'
import { useRealtimeMoodUpdates } from '../hooks/useRealtimeMoodUpdates'

import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { MLSentimentRadar } from '@/features/ml/components/MLSentimentRadar'
import { MoodForecastCard } from '@/features/ml/components/MoodForecastCard'
import { CrisisSentinelBanner } from '@/features/ml/components/CrisisSentinelBanner'

export interface MoodTrackerPageProps {
  userId?: string
  className?: string
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export const MoodTrackerPage: React.FC<MoodTrackerPageProps> = ({
  userId = 'me',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  /* 1. Initialize realtime WebSocket updates for surgical cache patching once on page mount */
  useRealtimeMoodUpdates(userId)

  /* 2. Read query state for page-level error and initial loading handling */
  const { isError, error, refetch, isLoading, data: history } = useMoodHistory({ userId })

  const totalEntries = history?.length ?? 0
  const todayEntry = history?.find((e) => {
    const entryDate = new Date(e.entry_date || e.created_at).toDateString()
    return entryDate === new Date().toDateString()
  })

  return (
    <motion.div
      variants={isAnimated ? containerVariants : undefined}
      initial={isAnimated ? 'hidden' : undefined}
      animate={isAnimated ? 'visible' : undefined}
      className={`w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6 ${className}`}
    >
      {/* ── Hero Header Section ── */}
      <motion.header
        variants={isAnimated ? sectionVariants : undefined}
        className="mb-6 sm:mb-8"
      >
        <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-sm p-6 sm:p-8 transition-colors duration-250">
          {/* Decorative gradient orb */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400 shadow-lg shadow-violet-500/10 shrink-0">
                <HugeiconsIcon icon={HeartIcon} className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-card-foreground">
                  Mood Tracker
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5 max-w-md">
                  Log how you feel, receive AI-powered reflections, and track your emotional patterns over time.
                </p>
              </div>
            </div>

            {/* Quick Stats Chips */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/80 border border-border text-xs text-muted-foreground">
                <HugeiconsIcon icon={Calendar01Icon} className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-medium">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>
              {totalEntries > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs text-violet-600 dark:text-violet-300">
                  <HugeiconsIcon icon={ChartLineData01Icon} className="w-3.5 h-3.5" />
                  <span className="font-semibold">{totalEntries} check-in{totalEntries !== 1 ? 's' : ''}</span>
                </div>
              )}
              {todayEntry && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-300">
                  <HugeiconsIcon icon={SparklesIcon} className="w-3.5 h-3.5" />
                  <span className="font-semibold">Checked in today</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Safety Sentinel Banner ── */}
      <motion.div variants={isAnimated ? sectionVariants : undefined} className="mb-5">
        <CrisisSentinelBanner />
      </motion.div>

      {/* ── Machine Learning Real-Time Sentiment & 7-Day Trajectory Row ── */}
      <motion.div variants={isAnimated ? sectionVariants : undefined} className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <MLSentimentRadar />
        <MoodForecastCard />
      </motion.div>

      {/* ── Error Boundary Handling ── */}
      {isError ? (
        <motion.div variants={isAnimated ? sectionVariants : undefined}>
          <ErrorState
            title="Unable to load mood tracker data"
            message={error?.message || 'A network error occurred while communicating with the server. Please try again.'}
            onRetry={refetch}
          />
        </motion.div>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {/* ── Primary Row: Mood Selector + AI Support ── */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 sm:gap-6">
            {/* Mood Selector — takes 3 cols on xl */}
            <motion.section
              variants={isAnimated ? sectionVariants : undefined}
              className="xl:col-span-3"
            >
              {isLoading ? (
                <div className="p-6 rounded-lg border border-white/[0.06] bg-[#18181B]/90 space-y-4">
                  <Skeleton className="h-6 w-48 bg-zinc-800" />
                  <Skeleton className="h-4 w-72 bg-zinc-800" />
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 rounded-xl bg-zinc-800" />
                    ))}
                  </div>
                </div>
              ) : (
                <MoodSelector userId={userId} />
              )}
            </motion.section>

            {/* AI Support Message — takes 2 cols on xl */}
            <motion.section
              variants={isAnimated ? sectionVariants : undefined}
              className="xl:col-span-2"
            >
              {isLoading ? (
                <div className="p-6 rounded-lg border border-white/[0.06] bg-[#18181B]/90 space-y-3 h-full">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg bg-zinc-800" />
                    <Skeleton className="h-6 w-40 bg-zinc-800" />
                  </div>
                  <Skeleton className="h-16 w-full rounded-xl bg-zinc-800" />
                  <Skeleton className="h-12 w-full rounded-xl bg-zinc-800" />
                </div>
              ) : (
                <AISupportMessageCard userId={userId} className="h-full" />
              )}
            </motion.section>
          </div>

          {/* ── Secondary Row: Chart + History List ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
            {/* Mood History Chart (higher z-index so tooltip floats over adjacent column) */}
            <motion.section variants={isAnimated ? sectionVariants : undefined} className="relative z-20">
              {isLoading ? (
                <div className="p-6 rounded-lg border border-white/[0.06] bg-[#18181B]/90 space-y-4">
                  <Skeleton className="h-6 w-40 bg-zinc-800" />
                  <Skeleton className="h-64 w-full rounded-xl bg-zinc-800" />
                </div>
              ) : (
                <MoodHistoryChart userId={userId} limit={30} className="h-full" />
              )}
            </motion.section>

            {/* Mood History List */}
            <motion.section variants={isAnimated ? sectionVariants : undefined} className="relative z-10">
              {isLoading ? (
                <div className="p-6 rounded-lg border border-white/[0.06] bg-[#18181B]/90 space-y-4">
                  <Skeleton className="h-6 w-48 bg-zinc-800" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl bg-zinc-800" />
                    ))}
                  </div>
                </div>
              ) : (
                <MoodHistoryList userId={userId} limit={100} className="h-full" />
              )}
            </motion.section>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default MoodTrackerPage
