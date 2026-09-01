import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SparklesIcon,
  HeartIcon,
  Message01Icon,
  Clock01Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons'

import { useMoodHistory } from '@/features/mood-tracker/hooks/useMoodHistory'
import { useRealtimeMoodUpdates } from '@/features/mood-tracker/hooks/useRealtimeMoodUpdates'
import { getMoodEmoji, getMoodLabel } from '@/lib/constants/moodOptions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export interface AISupportMessageCardProps {
  userId?: string
  className?: string
}

export const AISupportMessageCard: React.FC<AISupportMessageCardProps> = ({
  userId = 'me',
  className = '',
}) => {
  /* 1. Subscribe to real-time socket updates for surgical cache patching */
  useRealtimeMoodUpdates(userId)

  /* 2. Read directly from existing React Query cache */
  const { data: history, isLoading } = useMoodHistory({ userId })

  const latestEntry = history && history.length > 0 ? history[0] : null
  const hasAiMessage = Boolean(latestEntry?.ai_message)

  return (
    <Card className={`overflow-hidden border-border bg-card shadow-sm text-left rounded-lg flex flex-col transition-colors duration-250 ${className}`}>
      <CardHeader className="p-5 sm:p-6 pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
            <HugeiconsIcon icon={SparklesIcon} className="w-4.5 h-4.5" />
          </div>
          <CardTitle className="text-base sm:text-lg font-bold text-card-foreground">
            AI Reflection
          </CardTitle>
        </div>

        {latestEntry && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/80 border border-border text-xs text-muted-foreground font-medium">
            <span>{getMoodEmoji(latestEntry.mood_type)}</span>
            <span className="hidden sm:inline">{getMoodLabel(latestEntry.mood_type)}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-0 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* ── State 1: Initial Loading or Network Fetch ── */}
          {isLoading && !history && (
            <motion.div
              key="initial-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 pt-2"
            >
              <Skeleton className="h-4 w-3/4 bg-muted rounded-md" />
              <Skeleton className="h-4 w-full bg-muted/80 rounded-md" />
              <Skeleton className="h-4 w-2/3 bg-muted/60 rounded-md" />
            </motion.div>
          )}

          {/* ── State 2: Warm Empty State (No Mood Logged Yet) ── */}
          {!isLoading && !latestEntry && (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-6 text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center text-violet-500 dark:text-violet-400 mx-auto">
                <HugeiconsIcon icon={HeartIcon} className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-xs mx-auto">
                <p className="text-sm font-semibold text-card-foreground">
                  No Check-In Yet
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Log your mood and your personalized AI support message will appear here in real time.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── State 3: Generating Response in Background ── */}
          {latestEntry && !hasAiMessage && (
            <motion.div
              key="ai-generating-skeleton"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl border border-amber-500/15 bg-amber-500/10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 text-xs font-semibold">
                  <HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 animate-spin" />
                  <span>AI companion is reflecting on your check-in...</span>
                </div>
                <span className="text-[10px] text-amber-800/80 dark:text-amber-400/60 font-mono animate-pulse">Generating</span>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-3.5 w-full bg-amber-500/10 rounded-md animate-pulse" />
                <Skeleton className="h-3.5 w-4/5 bg-amber-500/10 rounded-md animate-pulse" />
                <Skeleton className="h-3.5 w-2/3 bg-amber-500/10 rounded-md animate-pulse" />
              </div>
            </motion.div>
          )}

          {/* ── State 4: Loaded AI Reflection Message ── */}
          {latestEntry && hasAiMessage && (
            <motion.div
              key={`ai-message-${latestEntry.id}`}
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="p-4 sm:p-5 rounded-xl border border-violet-500/20 bg-violet-500/10 dark:bg-violet-950/20 space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-violet-600 dark:text-violet-300">
                <div className="flex items-center gap-1.5 font-semibold">
                  <HugeiconsIcon icon={Message01Icon} className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                  <span>Supportive Insight</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <HugeiconsIcon icon={Clock01Icon} className="w-3.5 h-3.5" />
                  <span>
                    {new Date(latestEntry.created_at || latestEntry.entry_date).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-foreground leading-relaxed font-sans">
                "{latestEntry.ai_message}"
              </p>

              {latestEntry.note && (
                <div className="pt-2 border-t border-border text-[11px] text-muted-foreground italic">
                  Note: "{latestEntry.note}"
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

export default AISupportMessageCard
