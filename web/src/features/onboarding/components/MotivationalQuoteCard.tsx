import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Quote, RefreshCcw, Sparkles } from 'lucide-react'
import { useDailyContent } from '@/features/onboarding/hooks/useDailyContent'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export const MotivationalQuoteCard: React.FC = () => {
  const { quote, isLoading, isError, refetch } = useDailyContent()
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  /* Loading State: Skeleton Card */
  if (isLoading) {
    return (
      <div className="max-w-xl w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 p-8 space-y-4 shadow-xl mx-auto">
        <div className="flex items-center justify-between">
          <Skeleton className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800" />
          <Skeleton className="w-16 h-5 rounded-full bg-slate-200 dark:bg-zinc-800" />
        </div>
        <Skeleton className="w-full h-12 rounded-xl bg-slate-200 dark:bg-zinc-800" />
        <Skeleton className="w-32 h-4 rounded-md bg-slate-200 dark:bg-zinc-800 mx-auto" />
      </div>
    )
  }

  /* Error State: Elegant Fallback Card with Retry Button */
  if (isError || !quote) {
    return (
      <motion.div
        className="max-w-xl w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 text-slate-900 dark:text-zinc-100 backdrop-blur-xl p-8 text-center space-y-4 shadow-xl mx-auto"
        initial={isAnimated ? { opacity: 0, y: 10 } : undefined}
        animate={isAnimated ? { opacity: 1, y: 0 } : undefined}
      >
        <div className="w-12 h-12 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 font-serif">Today's Inspiration</h3>
        <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
          Today's inspiration is temporarily unavailable.
        </p>
        <Button
          variant="outline"
          onClick={() => refetch()}
          className="border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 gap-2 rounded-xl cursor-pointer"
        >
          <RefreshCcw className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <span>Retry</span>
        </Button>
      </motion.div>
    )
  }

  /* Loaded State: Framer Motion Glassmorphism Card */
  return (
    <motion.div
      className="max-w-xl w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 text-slate-900 dark:text-zinc-100 backdrop-blur-xl p-8 text-center space-y-5 shadow-2xl mx-auto relative overflow-hidden group select-none"
      initial={isAnimated ? { opacity: 0, y: 16 } : undefined}
      animate={isAnimated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Decorative Top Glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-violet-600/15 blur-3xl pointer-events-none" />

      {/* Card Header & Badge */}
      <div className="flex items-center justify-between relative z-10">
        <Quote className="w-8 h-8 text-amber-500 opacity-80" />
        <Badge
          variant="secondary"
          className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 text-xs font-semibold capitalize px-3 py-1 rounded-full"
        >
          {quote.category || 'Daily Focus'}
        </Badge>
      </div>

      {/* Quote Body */}
      <p className="text-lg sm:text-xl font-medium leading-relaxed text-slate-900 dark:text-zinc-100 tracking-tight relative z-10 font-serif italic">
        "{quote.text}"
      </p>

      {/* Author Attribution */}
      {quote.author && (
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 relative z-10">
          — {quote.author}
        </p>
      )}
    </motion.div>
  )
}

export default MotivationalQuoteCard
