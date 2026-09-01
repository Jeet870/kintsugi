import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SparklesIcon,
  RotateLeftIcon,
  WindPowerIcon,
  ViewIcon,
  HeartIcon,
  Leaf01Icon,
  ArrowRight01Icon,
  ArrowDown01Icon,
} from '@hugeicons/core-free-icons'

import { useCalmingTips } from '@/features/emergency-help/hooks/useCalmingTips'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/feedback/EmptyState'

export interface CalmingTipsListProps {
  className?: string
}

export const CalmingTipsList: React.FC<CalmingTipsListProps> = React.memo(({ className = '' }) => {
  const [showAll, setShowAll] = useState(false)
  const { data: tipsData, isLoading, isError, error, refetch } = useCalmingTips()

  const rawTips = tipsData ?? []
  const visibleTips = showAll ? rawTips : rawTips.slice(0, 3)

  const getTipStyling = (idx: number, category?: string) => {
    const cat = category?.toLowerCase() || ''
    if (cat.includes('breath') || idx === 0) {
      return {
        icon: WindPowerIcon,
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        iconBg: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400',
        badgeText: 'Breathing',
      }
    }
    if (cat.includes('ground') || idx === 1) {
      return {
        icon: ViewIcon,
        badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        iconBg: 'bg-blue-950/60 border-blue-500/30 text-blue-400',
        badgeText: 'Grounding',
      }
    }
    if (cat.includes('mindful') || idx === 2) {
      return {
        icon: HeartIcon,
        badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        iconBg: 'bg-purple-950/60 border-purple-500/30 text-purple-400',
        badgeText: 'Mindfulness',
      }
    }
    return {
      icon: Leaf01Icon,
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      iconBg: 'bg-amber-950/60 border-amber-500/30 text-amber-400',
      badgeText: 'Relaxation',
    }
  }

  return (
      <Card className={`overflow-hidden border border-border bg-card text-card-foreground shadow-xl text-left rounded-2xl h-full flex flex-col justify-between hover:border-amber-500/40 transition-colors ${className}`}>
        {/* Header: Title & Subtitle */}
        <CardHeader className="p-5 sm:p-6 pb-4 border-b border-border bg-muted/40 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-500 dark:text-teal-400 shrink-0 shadow-md">
              <HugeiconsIcon icon={Leaf01Icon} className="w-5 h-5 text-teal-500 dark:text-teal-400" />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-base sm:text-lg font-bold text-card-foreground font-serif">
                Instant Calming & Grounding Guidance
              </CardTitle>
              <p className="text-xs text-muted-foreground font-sans">
                Simple techniques to help you breathe, pause, and reset.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-3.5 flex-1 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* ── State 1: Skeleton Loading Placeholders ── */}
            {isLoading && (
              <motion.div key="loading-calming" className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-muted/40 space-y-2">
                    <Skeleton className="w-48 h-5 bg-muted" />
                    <Skeleton className="w-full h-4 bg-muted/60" />
                  </div>
                ))}
              </motion.div>
            )}

            {/* ── State 2: Error State ── */}
            {isError && !isLoading && (
              <motion.div
                key="error-calming"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-5 text-center space-y-3 bg-rose-500/10 border border-rose-500/20 rounded-xl"
              >
                <p className="text-xs text-rose-600 dark:text-rose-300">
                  Failed to load calming techniques: {error?.message || 'Server unavailable.'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="h-8 text-xs bg-background border-border text-foreground gap-1.5 cursor-pointer rounded-xl"
                >
                  <HugeiconsIcon icon={RotateLeftIcon} className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                  <span>Retry</span>
                </Button>
              </motion.div>
            )}

            {/* ── State 3: Empty State ── */}
            {!isLoading && !isError && rawTips.length === 0 && (
              <motion.div
                key="empty-calming"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4"
              >
                <EmptyState
                  icon={<HugeiconsIcon icon={SparklesIcon} className="w-7 h-7 text-teal-500 dark:text-teal-400" />}
                  title="No Guidance Available"
                  description="Calming exercises will refresh shortly."
                  size="sm"
                />
              </motion.div>
            )}

            {/* ── State 4: Populated Calming Tips List ── */}
            {!isLoading && !isError && rawTips.length > 0 && (
              <div className="space-y-3">
                <motion.div
                  key="calming-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {visibleTips.map((item, idx) => {
                    const styling = getTipStyling(idx, item.category)
                    const Icon = styling.icon

                    return (
                      <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.04 }}
                      >
                        <Card className="p-4 sm:p-4.5 rounded-xl border border-border bg-muted/30 hover:border-teal-500/40 transition-all flex items-center justify-between gap-3.5 group cursor-pointer shadow-xs">
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 mt-0.5 ${styling.iconBg}`}>
                              <HugeiconsIcon icon={Icon} className="w-5 h-5" />
                            </div>

                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h5 className="text-sm font-bold text-card-foreground font-serif truncate">
                                  {item.title}
                                </h5>
                                <span className={`text-[10px] uppercase font-mono font-medium px-2 py-0.5 rounded border shrink-0 ${styling.badgeBg}`}>
                                  {item.category || styling.badgeText}
                                </span>
                              </div>

                              <p className="text-xs text-muted-foreground leading-relaxed font-sans line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-1"
                          />
                        </Card>
                      </motion.div>
                    )
                  })}
                </motion.div>

                {/* View More Techniques Toggle Button */}
                {rawTips.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAll((prev) => !prev)}
                    className="w-full py-2.5 rounded-xl bg-muted/60 hover:bg-muted border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{showAll ? 'View Less Techniques' : 'View More Techniques'}</span>
                    <HugeiconsIcon
                      icon={ArrowDown01Icon}
                      className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                        showAll ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                )}
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
})

CalmingTipsList.displayName = 'CalmingTipsList'

export default CalmingTipsList
