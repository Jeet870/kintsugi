import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  HeartIcon,
  SparklesIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  RotateLeftIcon,
} from '@hugeicons/core-free-icons'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { ContentItem } from '@/types/api'

export interface AffirmationCardProps {
  affirmations?: ContentItem[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  className?: string
}

export const AffirmationCard: React.FC<AffirmationCardProps> = React.memo(
  ({ affirmations = [], isLoading = false, isError = false, onRetry, className = '' }) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const touchStartX = useRef<number | null>(null)

    const totalCount = affirmations.length
    const currentAffirmation = totalCount > 0 ? affirmations[currentIndex % totalCount] : null

    // Navigation Handlers
    const handleNext = useCallback(() => {
      if (totalCount <= 1) return
      setCurrentIndex((prev) => (prev + 1) % totalCount)
    }, [totalCount])

    const handlePrev = useCallback(() => {
      if (totalCount <= 1) return
      setCurrentIndex((prev) => (prev - 1 + totalCount) % totalCount)
    }, [totalCount])

    // Auto-rotation (8 seconds, pauses on hover)
    useEffect(() => {
      if (totalCount <= 1 || isPaused) return
      const interval = setInterval(() => {
        handleNext()
      }, 8000)
      return () => clearInterval(interval)
    }, [totalCount, isPaused, handleNext])

    // Keyboard Arrow Navigation
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') handlePrev()
        if (e.key === 'ArrowRight') handleNext()
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleNext, handlePrev])

    // Touch Swipe Gestures
    const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
      if (touchStartX.current === null) return
      const diffX = touchStartX.current - e.changedTouches[0].clientX
      if (Math.abs(diffX) > 40) {
        if (diffX > 0) handleNext()
        else handlePrev()
      }
      touchStartX.current = null
    }

    return (
      <Card
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`overflow-hidden p-6 sm:p-7 rounded-2xl border border-violet-500/20 bg-card text-card-foreground backdrop-blur-2xl shadow-xl text-left select-none relative hover:border-amber-500/40 transition-colors ${className}`}
      >
        {/* Header Badge & Navigation Control */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-500 dark:text-violet-400">
              <HugeiconsIcon icon={HeartIcon} className="w-4 h-4 text-violet-500 dark:text-violet-400" />
            </div>
            <h4 className="text-base font-bold text-card-foreground font-serif">
              Daily Affirmations
            </h4>
          </div>

          {!isLoading && !isError && totalCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-muted border border-border text-muted-foreground font-mono text-[11px] px-2.5 py-0.5"
              >
                {(currentIndex % totalCount) + 1} / {totalCount}
              </Badge>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrev}
                  disabled={totalCount <= 1}
                  className="w-7 h-7 bg-background border-border hover:bg-muted text-foreground rounded-lg cursor-pointer disabled:opacity-30 transition-colors"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  disabled={totalCount <= 1}
                  className="w-7 h-7 bg-background border-border hover:bg-muted text-foreground rounded-lg cursor-pointer disabled:opacity-30 transition-colors"
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-6 space-y-3">
            <Skeleton className="w-3/4 h-7 mx-auto bg-muted" />
            <Skeleton className="w-1/2 h-5 mx-auto bg-muted/60" />
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="py-6 text-center space-y-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
            <p className="text-xs text-rose-600 dark:text-rose-300">Failed to load daily affirmations from server.</p>
            {onRetry && (
              <Button
                variant="outline"
                onClick={onRetry}
                className="h-8 text-xs bg-background border-border text-foreground gap-1.5 cursor-pointer"
              >
                <HugeiconsIcon icon={RotateLeftIcon} className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
                <span>Retry</span>
              </Button>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && totalCount === 0 && (
          <div className="py-6">
            <EmptyState
              icon={<HugeiconsIcon icon={SparklesIcon} className="w-7 h-7 text-violet-500 dark:text-violet-400" />}
              title="No Affirmations Available"
              description="No active affirmations returned from server."
              size="sm"
            />
          </div>
        )}

        {/* Carousel Body */}
        {!isLoading && !isError && currentAffirmation && (
          <>
            <div className="flex items-center justify-between py-4 min-h-[110px]">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                disabled={totalCount <= 1}
                className="w-10 h-10 rounded-full bg-background border-border hover:bg-muted text-foreground cursor-pointer shrink-0 disabled:opacity-20 transition-colors"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
              </Button>

              <div className="flex-1 px-4 text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentAffirmation.id || currentIndex}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="space-y-3"
                  >
                    <p className="text-lg sm:text-xl font-medium text-card-foreground leading-relaxed font-sans max-w-xl mx-auto">
                      "{currentAffirmation.text}"
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={totalCount <= 1}
                className="w-10 h-10 rounded-full bg-background border-border hover:bg-muted text-foreground cursor-pointer shrink-0 disabled:opacity-20 transition-colors"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
              </Button>
            </div>

            {/* Indicator Dots & Category Badge */}
            <div className="pt-2 flex flex-col items-center gap-3">
              {totalCount > 1 && (
                <div className="flex items-center gap-1.5">
                  {affirmations.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === (currentIndex % totalCount)
                          ? 'w-6 bg-violet-500'
                          : 'w-1.5 bg-muted hover:bg-muted-foreground/40'
                      }`}
                    />
                  ))}
                </div>
              )}

              {currentAffirmation.category && (
                <Badge
                  variant="secondary"
                  className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs capitalize"
                >
                  <HugeiconsIcon icon={SparklesIcon} className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
                  <span>{currentAffirmation.category}</span>
                </Badge>
              )}
            </div>
          </>
        )}
      </Card>
    )
  },
)

AffirmationCard.displayName = 'AffirmationCard'

export default AffirmationCard
