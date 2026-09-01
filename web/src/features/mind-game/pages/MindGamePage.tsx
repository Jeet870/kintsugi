import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Brain02Icon,
  SparklesIcon,
  Leaf01Icon,
  HeartIcon,
  FocusIcon,
  CheckmarkCircle02Icon,
  PuzzleIcon,
  Shield02Icon,
} from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { CalmMatchGame } from '../components/CalmMatchGame'

export interface MindGamePageProps {
  className?: string
}

export const MindGamePage: React.FC<MindGamePageProps> = React.memo(({ className = '' }) => {
  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 12 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.35,
          ease: 'easeOut',
          staggerChildren: 0.1,
        },
      },
    }),
    [],
  )

  const itemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 8 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    }),
    [],
  )

  return (
    <main className={`min-h-screen bg-background text-foreground pb-16 pt-3 sm:pt-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 select-none font-sans relative ${className}`}>
      {/* Background Soft Layered Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-amber-500/5 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants as any}
        className="space-y-8"
      >
        {/* ── 1. Hero Header Bar ── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 text-left">
          <div className="flex items-start gap-3.5 z-10">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0 shadow-md mt-1">
              <HugeiconsIcon icon={Brain02Icon} className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-serif">
                Calm Match
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-sans max-w-md leading-relaxed">
                Take a quiet moment to slow your thoughts and gently improve focus through a relaxing memory exercise.
              </p>
            </div>
          </div>

          {/* Right Status Badge */}
          <div className="self-start sm:self-center shrink-0 z-10">
            <Badge
              variant="outline"
              className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-xs"
            >
              <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Mindfulness Exercise</span>
            </Badge>
          </div>
        </header>

        {/* ── 2. Session Parameters Banner ── */}
        <motion.section variants={itemVariants} aria-label="Session Controls & Environment">
          <Card className="p-4 sm:p-5 rounded-xl border border-border bg-card text-card-foreground backdrop-blur-xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-left hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
                <HugeiconsIcon icon={Leaf01Icon} className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground font-serif">
                  Gentle & Distraction-Free Space
                </h4>
                <p className="text-[11px] text-muted-foreground font-sans">
                  No timers, scores, or competitive pressure. Take as long as you need.
                </p>
              </div>
            </div>

            {/* Mindfulness Feature Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-muted border border-border text-amber-600 dark:text-amber-300 font-mono text-[10px]">
                No Timer
              </Badge>
              <Badge variant="secondary" className="bg-muted border border-border text-teal-600 dark:text-teal-300 font-mono text-[10px]">
                Relaxing
              </Badge>
              <Badge variant="secondary" className="bg-muted border border-border text-violet-600 dark:text-violet-300 font-mono text-[10px]">
                Low Pressure
              </Badge>
              <Badge variant="secondary" className="bg-muted border border-border text-emerald-600 dark:text-emerald-300 font-mono text-[10px]">
                Mindfulness
              </Badge>
            </div>
          </Card>
        </motion.section>

        {/* ── 3. Centered Memory Matching Game Container ── */}
        <motion.section variants={itemVariants} aria-label="Calm Match Memory Game">
          <CalmMatchGame className="w-full" />
        </motion.section>

        {/* ── 4. Supporting Informational Cards (Tips & Benefits Grid) ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Card A: How to Get the Most from This Exercise (Span 6 of 12) */}
          <Card className="lg:col-span-6 w-full p-6 sm:p-7 rounded-2xl border border-border bg-card text-card-foreground backdrop-blur-2xl shadow-sm hover:border-amber-500/40 transition-colors text-left flex flex-col justify-between space-y-4 h-full">
            <CardHeader className="p-0 space-y-1 border-b border-border pb-3">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-300 font-serif font-bold text-base">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                  <HugeiconsIcon icon={FocusIcon} className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                </div>
                <span>How to Get the Most from This Exercise</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-2.5 text-xs text-muted-foreground leading-relaxed font-sans flex-1 flex flex-col justify-center">
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Take your time</strong>: There is no clock counting down. Slow your pace.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Focus on remembering patterns</strong>: Allow your working memory to gently engage.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">No penalty for mistakes</strong>: Misses are part of the exercise, not failures.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Breathe naturally</strong>: Inhale smoothly as you reveal each pair.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Pause whenever you need</strong>: Take a break at any moment without penalty.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card B: Why This Helps (Span 6 of 12) */}
          <Card className="lg:col-span-6 w-full p-6 sm:p-7 rounded-2xl border border-border bg-card text-card-foreground backdrop-blur-2xl shadow-sm hover:border-amber-500/40 transition-colors text-left flex flex-col justify-between space-y-4 h-full">
            <CardHeader className="p-0 space-y-1 border-b border-border pb-3">
              <div className="flex items-center gap-2.5 text-violet-600 dark:text-violet-300 font-serif font-bold text-base">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400">
                  <HugeiconsIcon icon={HeartIcon} className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                </div>
                <span>Why This Helps</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-2.5 text-xs text-muted-foreground leading-relaxed font-sans flex-1 flex flex-col justify-center">
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-violet-500 dark:text-violet-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Encourages mindfulness</strong>: Grounds wandering thoughts in tactile interaction.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={FocusIcon} className="w-4 h-4 text-teal-500 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Improves attention span</strong>: Strengthens short-term visual recall.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={PuzzleIcon} className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Reduces mental overload</strong>: Replaces racing thoughts with simple pattern matching.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={Shield02Icon} className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Supports emotional regulation</strong>: Fosters calm concentration and presence.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={Leaf01Icon} className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Promotes gentle relaxation</strong>: Provides a soothing cognitive reset whenever you feel stressed.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </main>
  )
})

MindGamePage.displayName = 'MindGamePage'

export default MindGamePage
