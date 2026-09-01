import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  FireIcon,
  Medal01Icon,
  Award01Icon,
} from '@hugeicons/core-free-icons'

import { useProfile } from '@/features/profile/hooks/useProfile'
import { useRealtimeStreakUpdates } from '@/features/profile/hooks/useRealtimeStreakUpdates'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/feedback/EmptyState'

export interface MoodStreakCardProps {
  className?: string
}

export const MoodStreakCard: React.FC<MoodStreakCardProps> = React.memo(({ className = '' }) => {
  /* 1. Consume query data */
  const { data: profileData, isLoading, isError } = useProfile()

  /* 2. Subscribe to real-time WebSocket streak.updated events for automatic invalidation */
  useRealtimeStreakUpdates()

  const streak = profileData?.streak

  return (
    <Card className={`overflow-hidden rounded-2xl border-amber-500/30 bg-card text-card-foreground backdrop-blur-2xl shadow-xl text-left select-none relative h-full flex flex-col justify-between hover:border-amber-500/50 transition-colors ${className}`}>
      {/* Soft Background Kintsugi Gold Halo Glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-500/10 blur-3xl pointer-events-none" />

      <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border bg-muted/40 flex flex-row items-center justify-between space-y-0 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-md">
            <HugeiconsIcon icon={FireIcon} className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-card-foreground font-serif">
              Wellness Check-In Streak
            </CardTitle>
          </div>
        </div>

        <Badge
          variant="secondary"
          className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-semibold uppercase px-2.5 py-0.5"
        >
          Realtime Sync
        </Badge>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-5 relative z-10 flex-1 flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {/* ── State 1: Skeleton Loading Placeholders ── */}
          {isLoading && (
            <motion.div key="loading-streak" className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <Skeleton className="w-20 h-4 bg-muted" />
                <Skeleton className="w-12 h-8 bg-muted rounded-xl" />
              </div>
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <Skeleton className="w-20 h-4 bg-muted" />
                <Skeleton className="w-12 h-8 bg-muted rounded-xl" />
              </div>
            </motion.div>
          )}

          {/* ── State 2: Error / Missing Streak State ── */}
          {!isLoading && (isError || !streak) && (
            <motion.div key="empty-streak" className="py-2">
              <EmptyState
                icon={<HugeiconsIcon icon={FireIcon} className="w-8 h-8 text-amber-500 dark:text-amber-400" />}
                title="No Active Streak"
                description="Log your daily mood to build your wellness streak."
                size="sm"
              />
            </motion.div>
          )}

          {/* ── State 3: Populated Streak Display with Count Animation ── */}
          {!isLoading && streak && (
            <motion.div
              key="streak-content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Current Streak Stat Card */}
                <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/20 bg-muted/30 space-y-1.5 backdrop-blur-xl">
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-300 font-semibold">
                    <HugeiconsIcon icon={FireIcon} className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Current Streak</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={streak.current_streak}
                        initial={{ opacity: 0, y: -10, scale: 1.2 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="text-3xl sm:text-4xl font-bold font-serif text-amber-600 dark:text-amber-100"
                      >
                        {streak.current_streak}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-xs text-amber-600/80 dark:text-amber-400/80 font-mono font-medium">
                      {streak.current_streak === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>

                {/* Longest Streak Stat Card */}
                <div className="p-4 sm:p-5 rounded-2xl border border-violet-500/20 bg-muted/30 space-y-1.5 backdrop-blur-xl">
                  <div className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-300 font-semibold">
                    <HugeiconsIcon icon={Medal01Icon} className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                    <span>Longest Streak</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={streak.longest_streak}
                        initial={{ opacity: 0, y: -10, scale: 1.2 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="text-3xl sm:text-4xl font-bold font-serif text-foreground"
                      >
                        {streak.longest_streak}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-xs text-muted-foreground font-mono font-medium">
                      {streak.longest_streak === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Supportive Tone Message Footer */}
              <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/10 flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-200">
                <HugeiconsIcon icon={Award01Icon} className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                <p className="leading-relaxed font-sans">
                  You're building a healthy habit — every step counts toward your mental well-being.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
})

MoodStreakCard.displayName = 'MoodStreakCard'

export default MoodStreakCard
