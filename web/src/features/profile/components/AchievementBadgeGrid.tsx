import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Award01Icon,
  Medal01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons'

import { useProfile } from '@/features/profile/hooks/useProfile'
import { useRealtimeStreakUpdates } from '@/features/profile/hooks/useRealtimeStreakUpdates'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export interface AchievementBadgeGridProps {
  className?: string
}

export const AchievementBadgeGrid: React.FC<AchievementBadgeGridProps> = React.memo(
  ({ className = '' }) => {
    /* 1. Consume query data */
    const { data: profileData, isLoading } = useProfile()

    /* 2. Realtime WebSocket subscription for live achievement invalidation */
    useRealtimeStreakUpdates()

    const achievementsData = profileData?.achievements
    const earnedList = achievementsData?.earned_achievements ?? []

    /* Track initial session earned IDs to animate ONLY newly unlocked badges */
    const initialEarnedIdsRef = useRef<Set<string>>(new Set())

    useEffect(() => {
      if (earnedList.length > 0 && initialEarnedIdsRef.current.size === 0) {
        earnedList.forEach((b) => {
          if (b.id) initialEarnedIdsRef.current.add(String(b.id))
        })
      }
    }, [earnedList])

    return (
      <Card className={`overflow-hidden rounded-2xl border-border bg-card text-card-foreground shadow-xl text-left h-full flex flex-col justify-between hover:border-amber-500/40 transition-colors ${className}`}>
        <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border bg-muted/40 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-md">
              <HugeiconsIcon icon={Award01Icon} className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-card-foreground font-serif">
                Earned Badges & Milestones
              </CardTitle>
            </div>
          </div>

          <Badge variant="secondary" className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-xs px-2.5 py-0.5">
            {earnedList.length} Unlocked
          </Badge>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-muted/40 space-y-2">
                    <Skeleton className="w-10 h-10 rounded-xl bg-muted" />
                    <Skeleton className="w-24 h-4 bg-muted" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && earnedList.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground space-y-2 bg-muted/40 rounded-xl border border-border">
                <HugeiconsIcon icon={SparklesIcon} className="w-8 h-8 text-amber-500 dark:text-amber-400 mx-auto opacity-70" />
                <p className="font-semibold text-card-foreground">Your Milestone Journey Begins Here</p>
                <p>Log daily moods and write reflections to unlock your first badge.</p>
              </div>
            )}

            {!isLoading && earnedList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {earnedList.map((item, idx) => {
                  const itemIdStr = String(item.id || idx)
                  const isNewlyUnlocked = !initialEarnedIdsRef.current.has(itemIdStr)

                  return (
                    <motion.div
                      key={itemIdStr}
                      initial={isNewlyUnlocked ? { scale: 0.8, opacity: 0 } : { opacity: 1, scale: 1 }}
                      animate={isNewlyUnlocked ? { scale: [1, 1.08, 1], opacity: 1 } : { opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, ease: 'easeInOut', delay: idx * 0.04 }}
                      className="p-4 rounded-2xl border border-amber-500/30 bg-card text-card-foreground shadow-md hover:border-amber-500/50 transition-all flex items-start gap-3 select-none"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
                        <HugeiconsIcon icon={Medal01Icon} className="w-5 h-5" />
                      </div>

                      <div className="space-y-1 overflow-hidden min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className="text-xs font-bold text-card-foreground font-serif leading-snug">
                            {item.title || item.achievement?.title || 'Milestone Earned'}
                          </h5>
                          <HugeiconsIcon icon={SparklesIcon} className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed font-sans">
                          {item.description || item.achievement?.description || 'Personal wellness achievement.'}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    )
  },
)

AchievementBadgeGrid.displayName = 'AchievementBadgeGrid'

export default AchievementBadgeGrid
