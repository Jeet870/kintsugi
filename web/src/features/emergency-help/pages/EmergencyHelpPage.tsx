import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  HeartIcon,
  Shield02Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TalkToSomeoneCard } from '../components/TalkToSomeoneCard'
import { HelplineList } from '../components/HelplineList'
import { CalmingTipsList } from '../components/CalmingTipsList'

export interface EmergencyHelpPageProps {
  countryCode?: string
  className?: string
}

export const EmergencyHelpPage: React.FC<EmergencyHelpPageProps> = React.memo(
  ({ countryCode = 'IN', className = '' }) => {
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
      <div className={`min-h-screen bg-background text-foreground pb-16 pt-3 sm:pt-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 select-none font-sans relative ${className}`}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants as any}
          className="space-y-7"
        >
          {/* ── 1. Page Header ── */}
          <header className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 text-left">
            {/* Left Header Title & Subtitle */}
            <div className="flex items-start gap-3.5 z-10">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0 shadow-md mt-1">
                <HugeiconsIcon icon={HeartIcon} className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-serif">
                  Emergency Help
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-sans max-w-md leading-relaxed">
                  If you're feeling overwhelmed, you're not alone. Support is available, and help is only a tap away.
                </p>
              </div>
            </div>

            {/* Right Top Status Badge */}
            <div className="self-start sm:self-center shrink-0 z-10">
              <Badge
                variant="outline"
                className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-xs"
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Available 24/7</span>
              </Badge>
            </div>
          </header>

          {/* ── 2. Top Hero Card (TalkToSomeoneCard) ── */}
          <motion.section variants={itemVariants} aria-label="Immediate Crisis Care">
            <TalkToSomeoneCard countryCode={countryCode} className="w-full" />
          </motion.section>

          {/* ── 3. Main 12-Column Responsive Grid ── */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
            {/* Left Column: Helpline Directory (Span 7) */}
            <section className="lg:col-span-7 space-y-6 h-full flex flex-col justify-between" aria-label="Confidential Helplines">
              <HelplineList countryCode={countryCode} className="w-full h-full flex-1" />
            </section>

            {/* Right Column: Calming & Grounding Guidance (Span 5) */}
            <section className="lg:col-span-5 space-y-6 h-full flex flex-col justify-between" aria-label="Calming Guidance">
              <CalmingTipsList className="w-full h-full flex-1" />
            </section>
          </motion.div>

          {/* ── 4. Bottom Full-Width Safety Banner ── */}
          <motion.section variants={itemVariants} aria-label="Safety Plan Banner">
            <Card className="bg-card text-card-foreground border border-border rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm text-left hover:border-amber-500/40 transition-colors">
              {/* Left Side: Icon + Message */}
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-muted border border-border flex items-center justify-center text-teal-500 dark:text-teal-400 shrink-0 shadow-md">
                  <HugeiconsIcon icon={HeartIcon} className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-base sm:text-lg font-bold text-foreground font-serif">
                    You matter. You are not alone.
                  </h3>
                  <p className="text-xs text-muted-foreground font-sans">
                    Every step you take toward seeking help is a step toward healing.
                  </p>
                </div>
              </div>

              {/* Right Side: Action CTA Buttons */}
              <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                <Button
                  variant="outline"
                  className="bg-background border-border text-foreground hover:bg-muted rounded-xl h-11 px-4 text-xs font-semibold gap-2 cursor-pointer transition-colors"
                >
                  <HugeiconsIcon icon={Shield02Icon} className="w-4 h-4 text-muted-foreground" />
                  <span>Safety Plan</span>
                </Button>

                <Button className="bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 rounded-xl h-11 px-4 text-xs font-semibold gap-2 cursor-pointer transition-colors">
                  <span>Crisis Safety Tips</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 text-teal-600 dark:text-teal-300" />
                </Button>
              </div>
            </Card>
          </motion.section>
        </motion.div>
      </div>
    )
  },
)

EmergencyHelpPage.displayName = 'EmergencyHelpPage'

export default EmergencyHelpPage
