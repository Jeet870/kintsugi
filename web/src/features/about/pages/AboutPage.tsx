import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  InformationCircleIcon,
  HeartIcon,
  SparklesIcon,
  Shield02Icon,
  LockIcon,
  LifebuoyIcon,
  Leaf01Icon,
  Book01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons'

import { ROUTES } from '@/app/router/routes'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DisclaimerBanner } from '../components/DisclaimerBanner'
import { AboutContent } from '../components/AboutContent'

export interface AboutPageProps {
  className?: string
}

export const AboutPage: React.FC<AboutPageProps> = React.memo(({ className = '' }) => {
  const navigate = useNavigate()

  const handleNavigateEmergency = () => {
    navigate(ROUTES.EMERGENCY.HELP)
  }

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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-amber-500/5 via-violet-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

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
              <HugeiconsIcon icon={InformationCircleIcon} className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-serif">
                About Kintsugi
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-sans max-w-md leading-relaxed">
                Supporting emotional wellbeing through thoughtful technology, mindful reflection, and compassionate AI.
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
              <span>Version 1.0 • Mental Wellness Companion</span>
            </Badge>
          </div>
        </header>

        {/* ── 2. Full-Width Prominent Disclaimer Banner ── */}
        <motion.section variants={itemVariants} aria-label="Clinical Disclaimer">
          <DisclaimerBanner compact={false} className="w-full" />
        </motion.section>

        {/* ── 3. Editorial About Content Section ── */}
        <motion.section variants={itemVariants} aria-label="Kintsugi Story and Philosophy">
          <AboutContent className="w-full" />
        </motion.section>

        {/* ── 4. Additional Information Cards (Mission & Privacy Grid) ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Card A: Mission & Core Features (Span 6 of 12) */}
          <Card className="lg:col-span-6 w-full p-6 sm:p-7 rounded-2xl border border-border bg-card text-card-foreground shadow-xl text-left space-y-4 hover:border-amber-500/40 transition-colors">
            <CardHeader className="p-0 space-y-1 border-b border-border pb-3">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-300 font-serif font-bold text-base">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                  <HugeiconsIcon icon={HeartIcon} className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                </div>
                <span>Our Core Mission</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-3 text-xs text-muted-foreground leading-relaxed font-sans">
              <p>
                Kintsugi was built to transform daily emotional reflection from a chore into a calming, rewarding ritual. Every feature is designed to reinforce positive self-care habits:
              </p>
              <ul className="space-y-2 pt-1 font-mono text-[11px] text-muted-foreground">
                <li className="flex items-center gap-2">
                  <HugeiconsIcon icon={SparklesIcon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span>24/7 Empathetic Conversational Companion</span>
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon icon={Book01Icon} className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 shrink-0" />
                  <span>Encrypted & Private Mindful Journaling</span>
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon icon={Leaf01Icon} className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>Interactive 4-7-8 Breathing & Grounding Exercises</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card B: Privacy & Data Security Guarantee (Span 6 of 12) */}
          <Card className="lg:col-span-6 w-full p-6 sm:p-7 rounded-2xl border border-border bg-card text-card-foreground shadow-xl text-left space-y-4 hover:border-amber-500/40 transition-colors">
            <CardHeader className="p-0 space-y-1 border-b border-border pb-3">
              <div className="flex items-center gap-2.5 text-violet-600 dark:text-violet-300 font-serif font-bold text-base">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400">
                  <HugeiconsIcon icon={Shield02Icon} className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                </div>
                <span>Privacy & Security Commitments</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-3 text-xs text-muted-foreground leading-relaxed font-sans">
              <p>
                Your emotional reflections and personal journal entries belong solely to you. Kintsugi enforces strict privacy controls to safeguard your data:
              </p>
              <ul className="space-y-2 pt-1 font-mono text-[11px] text-muted-foreground">
                <li className="flex items-center gap-2">
                  <HugeiconsIcon icon={LockIcon} className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 shrink-0" />
                  <span>Encrypted Data Storage & Secure JWT Authentication</span>
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon icon={Shield02Icon} className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400 shrink-0" />
                  <span>Non-Judgmental, Private AI Companion Architecture</span>
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>Full User Data Export & Erasure Right</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── 5. Emergency Help Call-To-Action Reminder Card ── */}
        <motion.section variants={itemVariants} aria-label="Emergency Help Reminder">
          <Card className="bg-card border border-amber-500/40 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xl text-left select-none relative overflow-hidden hover:border-amber-500/60 transition-colors">
            <div className="space-y-1 relative z-10">
              <h3 className="text-base sm:text-lg font-bold text-card-foreground font-serif flex items-center gap-2">
                <HugeiconsIcon icon={LifebuoyIcon} className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <span>Need immediate help?</span>
              </h3>
              <p className="text-xs text-muted-foreground font-sans max-w-xl leading-relaxed">
                If you're experiencing emotional distress or are facing a crisis, confidential 24/7 emergency helplines are available instantly.
              </p>
            </div>

            <Button
              onClick={handleNavigateEmergency}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl h-11 px-5 text-xs sm:text-sm gap-2 shadow-md border border-amber-300/40 cursor-pointer shrink-0 min-h-[44px]"
            >
              <span>Go to Emergency Help</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 text-slate-950" />
            </Button>
          </Card>
        </motion.section>

        {/* ── 6. Platform Version Information Footer Card ── */}
        <motion.section variants={itemVariants} aria-label="Version Information">
          <Card className="p-4 rounded-xl border border-border bg-muted/30 text-center text-xs text-muted-foreground font-mono">
            <span>Kintsugi Platform • Version 1.0 • Mindful Self-Care & Mental Wellness Companion</span>
          </Card>
        </motion.section>
      </motion.div>
    </main>
  )
})

AboutPage.displayName = 'AboutPage'

export default AboutPage
