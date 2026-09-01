import React from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SparklesIcon,
  HeartIcon,
  Shield02Icon,
  Leaf01Icon,
  Compass01Icon,
  Book01Icon,
} from '@hugeicons/core-free-icons'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export interface AboutContentProps {
  className?: string
}

export const AboutContent: React.FC<AboutContentProps> = React.memo(({ className = '' }) => {
  return (
    <div className={`space-y-6 text-left ${className}`}>
      {/* Section 1: The Kintsugi Philosophy */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <Card className="overflow-hidden rounded-2xl border-amber-500/30 bg-card text-card-foreground backdrop-blur-2xl shadow-xl relative hover:border-amber-500/50 transition-colors">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-28 bg-amber-500/10 blur-3xl pointer-events-none" />

          <CardHeader className="p-6 sm:p-8 pb-4 border-b border-border bg-muted/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-md">
                <HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-card-foreground font-serif tracking-tight">
                  The Kintsugi Philosophy
                </CardTitle>
                <p className="text-xs text-amber-600 dark:text-amber-300/80 font-sans font-medium">
                  Embracing life's repairs with strength and gold
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans relative z-10">
            <p>
              <strong>Kintsugi</strong> (金継ぎ, "golden joinery") is the ancient Japanese art of repairing broken pottery with lacquer dusted or mixed with powdered gold. Rather than disguising cracks or treating fractures as flaws to hide, Kintsugi illuminates every repair as an integral, beautiful part of the object’s unique history.
            </p>
            <p>
              We believe human emotional wellbeing follows the same profound truth. Difficult seasons, trauma, and mental struggles leave marks, but they do not make you broken. Healing is not about returning to an unbroken past—it is about honoring your resilience and piecing yourself together with intention, care, and compassion.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 2: Our Mission & Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: 'easeOut' }}
        >
          <Card className="p-6 rounded-2xl border border-border bg-card text-card-foreground shadow-xl space-y-3 h-full hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400">
                <HugeiconsIcon icon={HeartIcon} className="w-5 h-5 text-violet-500 dark:text-violet-400" />
              </div>
              <h3 className="text-base font-bold text-card-foreground font-serif">
                Our Mission
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              To provide a safe, accessible, and empathetic companion space where every individual can track their emotional wellbeing, process daily experiences, and practice mindfulness without judgment or pressure.
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12, ease: 'easeOut' }}
        >
          <Card className="p-6 rounded-2xl border border-border bg-card text-card-foreground shadow-xl space-y-3 h-full hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                <HugeiconsIcon icon={Leaf01Icon} className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-card-foreground font-serif">
                Gentle & Non-Linear Growth
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Personal growth is not a straight line. Kintsugi celebrates every step—whether logging a moment of sadness or celebrating a 7-day streak—fostering self-compassion above competition.
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Section 3: Comprehensive Companion Suite */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.16, ease: 'easeOut' }}
      >
        <Card className="p-6 sm:p-8 rounded-2xl border border-border bg-card text-card-foreground shadow-xl space-y-4 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
              <HugeiconsIcon icon={Compass01Icon} className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-card-foreground font-serif">
              How Kintsugi Supports You
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-300">
                <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>AI Companion</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                24/7 empathetic conversational companion for real-time reflection and support.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-600 dark:text-violet-300">
                <HugeiconsIcon icon={Book01Icon} className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                <span>Mindful Journaling</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Encrypted, private space to process thoughts with guided prompts and self-reflection.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-300">
                <HugeiconsIcon icon={Leaf01Icon} className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Guided Breathing & Grounding</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Interactive 4-7-8 breathing cycles and 5-4-3-2-1 sensory grounding techniques.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-300">
                <HugeiconsIcon icon={Shield02Icon} className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Emergency Help Resources</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Instant 1-tap connection to confidential regional helplines and crisis support.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
})

AboutContent.displayName = 'AboutContent'

export default AboutContent
