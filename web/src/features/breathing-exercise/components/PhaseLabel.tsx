import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BreathingPhase } from '../hooks/useBreathingCycle'

export interface PhaseLabelProps {
  phase: BreathingPhase
  remainingTime?: number
  className?: string
}

const PHASE_TEXT_MAP: Record<BreathingPhase, { title: string; subtitle: string }> = {
  inhale: {
    title: 'Breathe In',
    subtitle: 'Fill your lungs with calm, restorative air',
  },
  hold: {
    title: 'Hold',
    subtitle: 'Maintain stillness and gentle awareness',
  },
  exhale: {
    title: 'Breathe Out',
    subtitle: 'Release tension and let go of stress',
  },
}

export const PhaseLabel: React.FC<PhaseLabelProps> = React.memo(
  ({ phase, remainingTime, className = '' }) => {
    const textInfo = PHASE_TEXT_MAP[phase] || PHASE_TEXT_MAP.inhale
    const formattedSeconds = remainingTime !== undefined ? Math.ceil(remainingTime) : null

    return (
      <div className={`text-center space-y-2 select-none ${className}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-1.5"
          >
            <h3 className="text-3xl sm:text-4xl font-bold text-foreground font-serif tracking-tight">
              {textInfo.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {textInfo.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {formattedSeconds !== null && (
          <div className="pt-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-mono text-xs font-semibold">
              {formattedSeconds}s
            </span>
          </div>
        )}
      </div>
    )
  },
)

PhaseLabel.displayName = 'PhaseLabel'

export default PhaseLabel
