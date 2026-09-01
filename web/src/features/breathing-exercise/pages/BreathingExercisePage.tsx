import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SparklesIcon,
  Leaf01Icon,
  HeartIcon,
  FocusIcon,
  CheckmarkCircle02Icon,
  Shield02Icon,
  RotateLeftIcon,
} from '@hugeicons/core-free-icons'

import { useBreathingCycle } from '../hooks/useBreathingCycle'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

import { BreathingCircle } from '../components/BreathingCircle'
import { PhaseLabel } from '../components/PhaseLabel'
import { BreathingControls } from '../components/BreathingControls'

export interface BreathingExercisePageProps {
  className?: string
}

export const BreathingExercisePage: React.FC<BreathingExercisePageProps> = React.memo(({ className = '' }) => {
  const [sessionDurationSec, setSessionDurationSec] = React.useState<number>(180)
  const [sessionRemainingTime, setSessionRemainingTime] = React.useState<number>(180)
  const [isCompleted, setIsCompleted] = React.useState<boolean>(false)

  const {
    phase,
    progress,
    cycle,
    isRunning,
    isPaused,
    remainingTime: phaseRemainingTime,
    start,
    pause,
    resume,
    reset: resetCycle,
  } = useBreathingCycle({
    durations: { inhale: 4, hold: 4, exhale: 6 },
  })

  /* Countdown timer interval for total session duration */
  React.useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null
    if (isRunning && !isPaused && sessionRemainingTime > 0) {
      timer = setInterval(() => {
        setSessionRemainingTime((prev) => {
          if (prev <= 1) {
            setIsCompleted(true)
            resetCycle()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isRunning, isPaused, sessionRemainingTime, resetCycle])

  const handleStart = React.useCallback(() => {
    setIsCompleted(false)
    setSessionRemainingTime(sessionDurationSec)
    start()
  }, [sessionDurationSec, start])

  const handlePause = React.useCallback(() => {
    pause()
  }, [pause])

  const handleResume = React.useCallback(() => {
    resume()
  }, [resume])

  const handleReset = React.useCallback(() => {
    resetCycle()
    setIsCompleted(false)
    setSessionRemainingTime(sessionDurationSec)
  }, [resetCycle, sessionDurationSec])

  const handleDurationChange = React.useCallback(
    (seconds: number) => {
      setSessionDurationSec(seconds)
      setSessionRemainingTime(seconds)
    },
    [],
  )

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
      {/* Ambient Background Soft Radial Glow */}
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
              <HugeiconsIcon icon={Leaf01Icon} className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-serif">
                Breathing Exercise
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-sans max-w-md leading-relaxed">
                Slow your breathing, quiet your mind, and take a moment to reconnect with yourself.
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
              <span>Mindfulness Session</span>
            </Badge>
          </div>
        </header>

        {/* ── 2. Session Parameters & Environment Card ── */}
        <motion.section variants={itemVariants} aria-label="Session Overview & Badges">
          <Card className="p-4 sm:p-5 rounded-xl border border-border bg-card text-card-foreground backdrop-blur-xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-left hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
                <HugeiconsIcon icon={Leaf01Icon} className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground font-serif">
                  Guided 4-7-8 Rhythm
                </h4>
                <p className="text-[11px] text-muted-foreground font-sans">
                  Take slow breaths. Follow the circle. Pause whenever you need.
                </p>
              </div>
            </div>

            {/* Session Feature Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-muted border border-border text-amber-600 dark:text-amber-300 font-mono text-[10px]">
                Guided
              </Badge>
              <Badge variant="secondary" className="bg-muted border border-border text-teal-600 dark:text-teal-300 font-mono text-[10px]">
                Relaxing
              </Badge>
              <Badge variant="secondary" className="bg-muted border border-border text-violet-600 dark:text-violet-300 font-mono text-[10px]">
                No Pressure
              </Badge>
              <Badge variant="secondary" className="bg-muted border border-border text-emerald-600 dark:text-emerald-300 font-mono text-[10px]">
                Mindfulness
              </Badge>
            </div>
          </Card>
        </motion.section>

        {/* ── 3. Main Breathing Centerpiece Container (Max-W 600px Centered) ── */}
        <motion.section variants={itemVariants} aria-label="Breathing Circle Guided Experience">
          <Card className="p-6 sm:p-10 rounded-2xl border border-amber-500/30 bg-card text-card-foreground backdrop-blur-2xl shadow-xl text-center space-y-8 max-w-[600px] mx-auto relative overflow-hidden">
            {/* Ambient Inner Halo Glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/10 blur-3xl pointer-events-none" />

            {/* Dynamic Phase Label Header */}
            <PhaseLabel phase={phase} remainingTime={phaseRemainingTime} />

            {/* Primary Breathing Circle Orb */}
            <div className="py-2">
              <BreathingCircle phase={phase} progress={progress} />
            </div>

            {/* Controls Component */}
            <BreathingControls
              isRunning={isRunning}
              isPaused={isPaused}
              cycle={cycle}
              remainingTime={sessionRemainingTime}
              sessionDurationSec={sessionDurationSec}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onReset={handleReset}
              onDurationChange={handleDurationChange}
            />

            {/* Subtle Phase Progress Bar */}
            <div className="space-y-1.5 pt-2 max-w-md mx-auto">
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>Phase Progress</span>
                <span className="text-amber-500 dark:text-amber-400 font-bold">{Math.round(progress * 100)}%</span>
              </div>
              <Progress value={progress * 100} className="h-1.5 bg-muted border-none rounded-full" />
            </div>

            {/* Session Completion Card Overlay */}
            <AnimatePresence>
              {isCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute inset-0 bg-card/95 backdrop-blur-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 z-30"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 dark:text-amber-300 shadow-xl">
                    <HugeiconsIcon icon={SparklesIcon} className="w-7 h-7 text-amber-500 dark:text-amber-400" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold font-serif text-foreground">
                      Well done.
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans max-w-sm">
                      You've completed your breathing session. Take a moment to notice how your body and mind feel now.
                    </p>
                  </div>

                  <div className="pt-3">
                    <Button
                      onClick={handleReset}
                      className="h-11 px-6 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 border border-amber-300/40 gap-2 cursor-pointer min-h-[44px]"
                    >
                      <HugeiconsIcon icon={RotateLeftIcon} className="w-4 h-4 text-zinc-950" />
                      <span>Start New Session</span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.section>

        {/* ── 4. Supporting Informational Cards (Benefits & Tips Grid) ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Card A: Benefits of Mindful Breathing (Span 6 of 12) */}
          <Card className="lg:col-span-6 w-full p-6 sm:p-7 rounded-2xl border border-border bg-card text-card-foreground backdrop-blur-2xl shadow-sm hover:border-amber-500/40 transition-colors text-left space-y-4">
            <CardHeader className="p-0 space-y-1 border-b border-border pb-3">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-300 font-serif font-bold text-base">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                  <HugeiconsIcon icon={HeartIcon} className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                </div>
                <span>Benefits of Mindful Breathing</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-2.5 text-xs text-muted-foreground leading-relaxed font-sans">
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Helps reduce stress</strong>: Triggers the parasympathetic nervous system.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Encourages emotional balance</strong>: Lowers heart rate and eases anxiety.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Improves focus</strong>: Clears mental fog through oxygenated awareness.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Supports relaxation</strong>: Prepares mind and body for restful sleep.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Promotes present-moment awareness</strong>: Grounds thoughts in physical sensation.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card B: Helpful Tips (Span 6 of 12) */}
          <Card className="lg:col-span-6 w-full p-6 sm:p-7 rounded-2xl border border-border bg-card text-card-foreground backdrop-blur-2xl shadow-sm hover:border-amber-500/40 transition-colors text-left space-y-4">
            <CardHeader className="p-0 space-y-1 border-b border-border pb-3">
              <div className="flex items-center gap-2.5 text-violet-600 dark:text-violet-300 font-serif font-bold text-base">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400">
                  <HugeiconsIcon icon={FocusIcon} className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                </div>
                <span>Helpful Tips</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-2.5 text-xs text-muted-foreground leading-relaxed font-sans">
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-violet-500 dark:text-violet-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Sit comfortably</strong>: Keep your spine straight but relaxed.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-violet-500 dark:text-violet-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Relax your shoulders</strong>: Drop tension in neck, jaw, and shoulders.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-violet-500 dark:text-violet-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Breathe naturally</strong>: Inhale through nose, exhale gently through mouth.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-violet-500 dark:text-violet-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Follow the rhythm</strong>: Allow the expanding orb to guide your breath.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={Shield02Icon} className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Pause whenever needed</strong>: Resume session whenever you feel ready.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </main>
  )
})

BreathingExercisePage.displayName = 'BreathingExercisePage'

export default BreathingExercisePage
