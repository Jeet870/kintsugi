import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SparklesIcon,
  Calendar01Icon,
  Sun01Icon,
  HeartIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons'

import { formatShortDate } from '@/lib/utils/formatDate'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/feedback/EmptyState'

import { useDailyContent } from '../hooks/useDailyContent'
import { QuoteCard } from '../components/QuoteCard'
import { AffirmationCard } from '../components/AffirmationCard'
import { SelfCareTipList } from '../components/SelfCareTipList'
import type { ContentItem } from '@/types/api'
import glowingHeartImg from '@/assets/glowing_heart_hands.png'


export const DailyMotivationPage: React.FC = React.memo(() => {
  const {
    quoteQuery,
    affirmationsQuery,
    tipsQuery,
    data,
    isLoading,
    isError,
  } = useDailyContent()

  const [currentQuote, setCurrentQuote] = React.useState<ContentItem | null>(null)
  const [topAffirmationIndex, setTopAffirmationIndex] = React.useState(0)

  // Sync backend quote data when loaded
  React.useEffect(() => {
    if (quoteQuery.data) {
      setCurrentQuote(quoteQuery.data)
    }
  }, [quoteQuery.data])

  const todayStr = useMemo(() => formatShortDate(new Date()), [])

  const hasContent = useMemo(() => {
    return Boolean(
      (quoteQuery.data && quoteQuery.data.text) ||
      (affirmationsQuery.data && affirmationsQuery.data.length > 0) ||
      (tipsQuery.data && tipsQuery.data.length > 0)
    )
  }, [quoteQuery.data, affirmationsQuery.data, tipsQuery.data])

  // Handle error state gracefully with user-friendly toast
  React.useEffect(() => {
    if (isError) {
      toast.warning("Today's inspiration is being prepared", {
        description: 'Please try again shortly.',
      })
    }
  }, [isError])

  const activeAffirmations = data.affirmations
  const topAffirmation = activeAffirmations.length > 0 ? activeAffirmations[topAffirmationIndex % activeAffirmations.length] : null

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 pt-4 sm:pt-6 px-4 sm:px-6 lg:px-10 max-w-[1400px] mx-auto space-y-8 select-none font-sans relative">
      {/* Background Soft Layered Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-amber-500/5 via-violet-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Page Header Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-md">
              <HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
              Daily Motivation
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-sans max-w-2xl leading-relaxed">
            Take a quiet moment to reconnect with yourself through today's inspiration, affirmations, and gentle reminders.
          </p>
        </div>

        {/* Header Actions: Date Badge */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <Badge
            variant="outline"
            className="bg-card border-border text-foreground font-mono text-xs px-3 py-1.5 rounded-xl gap-1.5 shadow-xs"
          >
            <HugeiconsIcon icon={Calendar01Icon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Today • {todayStr}</span>
          </Badge>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="space-y-8">
        <AnimatePresence mode="wait">
          {/* Empty State when Backend returns no content at all */}
          {!isLoading && !isError && !hasContent && (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center"
            >
              <EmptyState
                icon={<HugeiconsIcon icon={Sun01Icon} className="w-10 h-10 text-amber-500 dark:text-amber-400" />}
                title="No daily content available."
                description="Please check back later for your daily affirmations and self-care practices."
              />
            </motion.div>
          )}

          {/* Populated 12-Column Responsive Layout */}
          {(isLoading || isError || hasContent) && (
            <motion.div
              key="populated-layout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-8"
            >
              {/* 12-Column Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Column (Span 7 of 12) */}
                <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
                  {/* Hero Quote Card Section */}
                  <QuoteCard
                    quote={currentQuote || quoteQuery.data}
                    isLoading={quoteQuery.isLoading}
                    isError={quoteQuery.isError}
                    className="w-full flex-1"
                  />

                  {/* Daily Affirmations Carousel Section */}
                  <AffirmationCard
                    affirmations={data.affirmations}
                    isLoading={affirmationsQuery.isLoading}
                    isError={affirmationsQuery.isError}
                    onRetry={() => affirmationsQuery.refetch()}
                    className="w-full"
                  />
                </div>

                {/* Right Column (Span 5 of 12) */}
                <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
                  {/* Today's Affirmation Glass Card (Top Right) */}
                  <Card className="rounded-2xl border border-violet-500/30 bg-card text-card-foreground p-6 text-center shadow-md relative overflow-hidden min-h-[150px] flex flex-col justify-between items-center text-left hover:border-amber-500/40 transition-colors">
                    <div className="flex items-center justify-between w-full border-b border-border pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={HeartIcon} className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                        <h4 className="text-xs font-bold text-card-foreground font-serif">Today's Affirmation</h4>
                      </div>
                      {activeAffirmations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setTopAffirmationIndex((prev) => prev + 1)}
                          className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer font-sans transition-colors"
                        >
                          Next →
                        </button>
                      )}
                    </div>

                    <p className="text-sm sm:text-base font-serif italic text-card-foreground max-w-xs my-auto py-2">
                      "{topAffirmation?.text || 'I am growing and evolving every single day.'}"
                    </p>

                    {/* Pagination dots */}
                    {activeAffirmations.length > 1 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {activeAffirmations.slice(0, 5).map((_, i) => (
                          <span
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              i === (topAffirmationIndex % Math.max(1, activeAffirmations.length))
                                ? 'bg-violet-500 w-3'
                                : 'bg-muted w-1.5'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Self-Care Tips List (Bottom Right) */}
                  <SelfCareTipList
                    tips={data.tips}
                    isLoading={tipsQuery.isLoading}
                    isError={tipsQuery.isError}
                    onRetry={() => tipsQuery.refetch()}
                    className="w-full flex-1"
                  />
                </div>
              </div>

              {/* Full-Width Bottom Inspiration Banner */}
              <Card className="rounded-2xl border border-amber-500/30 bg-card text-card-foreground p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden text-left hover:border-amber-500/40 transition-colors">
                {/* Background Artwork Overlay */}
                <div
                  className="absolute inset-0 bg-contain bg-right bg-no-repeat opacity-15 pointer-events-none"
                  style={{ backgroundImage: `url(${glowingHeartImg})` }}
                />

                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0 shadow-md">
                    <HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-bold font-serif text-foreground">
                      Remember to be kind to yourself.
                    </h3>
                    <p className="text-xs text-muted-foreground font-sans">
                      You are doing better than you think.
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold rounded-xl px-5 py-2.5 h-10 text-xs gap-2 shrink-0 cursor-pointer shadow-xs relative z-10 transition-colors"
                >
                  <span>Explore More</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
})

DailyMotivationPage.displayName = 'DailyMotivationPage'

export default DailyMotivationPage
