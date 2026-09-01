import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SparklesIcon,
  RotateLeftIcon,
  HeartIcon,
  Share01Icon,
  FireIcon,
  QuoteUpIcon,
} from '@hugeicons/core-free-icons'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { ContentItem } from '@/types/api'
import goldenSunsetImg from '@/assets/golden_sunset_landscape.png'

export interface QuoteCardProps {
  quote?: ContentItem | null
  isLoading?: boolean
  isError?: boolean
  onNewQuote?: () => void
  className?: string
}

export const QuoteCard: React.FC<QuoteCardProps> = React.memo(
  ({ quote, isLoading = false, isError = false, onNewQuote, className = '' }) => {
    const [isSaved, setIsSaved] = useState(false)

    const renderHighlightedQuoteText = (text: string) => {
      const parts = text.split(/(Light|peace|courage|strength|resilience|growth|hope|love)/i)
      return parts.map((part, i) => {
        if (/^(Light|peace|courage|strength|resilience|growth|hope|love)$/i.test(part)) {
          return (
            <span key={i} className="text-amber-400 font-bold not-italic font-serif underline decoration-amber-500/40 underline-offset-4">
              {part}
            </span>
          )
        }
        return part
      })
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={className}
      >
        <Card className="relative overflow-hidden p-6 sm:p-8 rounded-2xl border border-amber-500/30 bg-card text-card-foreground shadow-xl text-left select-none group min-h-[340px] flex flex-col justify-between hover:border-amber-500/40 transition-colors">
          {/* Background Sunset Landscape & Gradient Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity pointer-events-none transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${goldenSunsetImg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/85 to-card/40 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex items-center justify-between relative z-10">
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-xs"
            >
              <HugeiconsIcon icon={SparklesIcon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Quote of the Day</span>
            </Badge>

            <div className="flex items-center gap-2 bg-muted/60 border border-amber-500/30 px-3 py-1.5 rounded-2xl shadow-sm backdrop-blur-md">
              <HugeiconsIcon icon={FireIcon} className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse" />
              <div className="flex flex-col text-left leading-none">
                <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-300">66</span>
                <span className="text-[9px] font-sans text-muted-foreground font-medium">Inspiration Score</span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="relative z-10 my-8 space-y-4">
              <Skeleton className="w-12 h-12 rounded-2xl bg-muted" />
              <Skeleton className="w-full h-8 bg-muted/80" />
              <Skeleton className="w-2/3 h-8 bg-muted/60" />
            </div>
          )}

          {/* Error State */}
          {isError && !isLoading && (
            <div className="relative z-10 my-8 text-center space-y-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
              <p className="text-xs text-rose-600 dark:text-rose-300">Failed to load daily quote from server.</p>
              {onNewQuote && (
                <Button
                  variant="outline"
                  onClick={onNewQuote}
                  className="h-8 text-xs bg-background border-border text-foreground gap-1.5 cursor-pointer"
                >
                  <HugeiconsIcon icon={RotateLeftIcon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>Retry</span>
                </Button>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && !quote && (
            <div className="relative z-10 my-8">
              <EmptyState
                icon={<HugeiconsIcon icon={SparklesIcon} className="w-8 h-8 text-amber-500 dark:text-amber-400" />}
                title="No Quote Available"
                description="Check back later for today's motivational quote."
                size="sm"
              />
            </div>
          )}

          {/* Quote Body */}
          {!isLoading && !isError && quote && (() => {
            const hasAuthorInText = quote.text.includes(' — ')
            const [rawQuoteText, rawAuthor] = hasAuthorInText ? quote.text.split(' — ') : [quote.text, quote.author]
            const authorName = rawAuthor || quote.author || 'Anonymous'

            return (
              <div className="relative z-10 space-y-3 my-6 max-w-2xl">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-md mb-2">
                  <HugeiconsIcon icon={QuoteUpIcon} className="w-5 h-5" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif italic text-card-foreground leading-relaxed tracking-tight">
                  "{renderHighlightedQuoteText(rawQuoteText)}"
                </h2>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <p className="text-sm font-serif italic text-amber-600 dark:text-amber-300 font-medium tracking-wide">
                    — {authorName}
                  </p>
                  {quote.category && (
                    <Badge
                      variant="outline"
                      className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] px-2 py-0 rounded-full font-mono capitalize"
                    >
                      {quote.category}
                    </Badge>
                  )}
                </div>
              </div>
            )
          })()}

          {/* Footer Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSaved((prev) => !prev)}
                className={`h-9 px-3.5 rounded-xl border text-xs gap-1.5 cursor-pointer transition-colors ${
                  isSaved
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-700 dark:text-amber-300'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
              >
                <HugeiconsIcon icon={HeartIcon} className={`w-3.5 h-3.5 ${isSaved ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                <span>{isSaved ? 'Saved' : 'Save Quote'}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3.5 rounded-xl bg-background border-border text-foreground hover:bg-muted text-xs gap-1.5 cursor-pointer transition-colors"
              >
                <HugeiconsIcon icon={Share01Icon} className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  },
)

QuoteCard.displayName = 'QuoteCard'

export default QuoteCard
