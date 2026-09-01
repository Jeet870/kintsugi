import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SparklesIcon,
  Leaf01Icon,
  RotateLeftIcon,
  HeartIcon,
  WindPowerIcon,
  Task01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { ContentItem } from '@/types/api'

export interface SelfCareTipListProps {
  tips?: ContentItem[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  className?: string
}

export const SelfCareTipList: React.FC<SelfCareTipListProps> = React.memo(
  ({ tips = [], isLoading = false, isError = false, onRetry, className = '' }) => {
    const todayKey = React.useMemo(() => {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }, [])
    const storageKey = `kintsugi_selfcare_completed_${todayKey}`

    const [completedIds, setCompletedIds] = useState<Record<string | number, boolean>>(() => {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) return JSON.parse(saved)
      } catch (e) {
        console.warn('Could not read saved self-care completion state:', e)
      }
      return {}
    })

    const toggleComplete = (id: string | number) => {
      setCompletedIds((prev) => {
        const updated = {
          ...prev,
          [id]: !prev[id],
        }
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated))
        } catch (e) {
          console.warn('Could not save self-care completion state:', e)
        }
        return updated
      })
    }

    const getTipIcon = (idx: number) => {
      const icons = [WindPowerIcon, Leaf01Icon, Task01Icon, HeartIcon]
      return icons[idx % icons.length]
    }

    return (
      <Card className={`overflow-hidden border border-border bg-card text-card-foreground shadow-xl text-left rounded-2xl hover:border-amber-500/40 transition-colors ${className}`}>
        <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border bg-muted/40 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
              <HugeiconsIcon icon={Leaf01Icon} className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <CardTitle className="text-base font-bold text-card-foreground font-serif">
              Self-Care Tips ({tips.length})
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          <AnimatePresence mode="wait">
            {/* Loading Skeleton */}
            {isLoading && (
              <motion.div
                key="loading-tips"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/60">
                    <Skeleton className="w-9 h-9 rounded-full bg-muted shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="w-3/4 h-4 bg-muted" />
                      <Skeleton className="w-full h-3 bg-muted/60" />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Error State */}
            {isError && !isLoading && (
              <motion.div
                key="error-tips"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 text-center space-y-3 bg-rose-500/10 border border-rose-500/20 rounded-xl"
              >
                <p className="text-xs text-rose-600 dark:text-rose-300">
                  Failed to load self-care practices.
                </p>
                {onRetry && (
                  <Button
                    variant="outline"
                    onClick={onRetry}
                    className="h-8 text-xs bg-background border-border text-foreground gap-1.5 cursor-pointer"
                  >
                    <HugeiconsIcon icon={RotateLeftIcon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>Retry</span>
                  </Button>
                )}
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && tips.length === 0 && (
              <motion.div
                key="empty-tips"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4"
              >
                <EmptyState
                  icon={<HugeiconsIcon icon={SparklesIcon} className="w-7 h-7 text-amber-500 dark:text-amber-400" />}
                  title="No Self-Care Tips Available"
                  description="No active tips returned from server."
                  size="sm"
                />
              </motion.div>
            )}

            {/* Render ALL Tip Items */}
            {!isLoading && !isError && tips.length > 0 && (
              <motion.div
                key="tips-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1"
              >
                {tips.map((tip, idx) => {
                  const isDone = Boolean(completedIds[tip.id])
                  const Icon = getTipIcon(idx)
                  return (
                    <motion.div
                      key={tip.id || idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      onClick={() => toggleComplete(tip.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 text-left ${
                        isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-200'
                          : 'bg-muted/40 hover:bg-muted/80 border-border text-foreground'
                      }`}
                    >
                      <button
                        type="button"
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isDone
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400'
                        }`}
                      >
                        <HugeiconsIcon icon={isDone ? CheckmarkCircle02Icon : Icon} className="w-4 h-4" />
                      </button>

                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h5 className={`text-xs sm:text-sm font-bold font-sans tracking-tight ${isDone ? 'line-through opacity-70' : ''}`}>
                          {tip.category ? tip.category.toUpperCase() : 'MINDFUL PRACTICE'}
                        </h5>
                        <p className={`text-[11px] leading-relaxed font-sans ${isDone ? 'text-emerald-700/80 dark:text-emerald-300/70' : 'text-muted-foreground'}`}>
                          {tip.text}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    )
  },
)

SelfCareTipList.displayName = 'SelfCareTipList'

export default SelfCareTipList
