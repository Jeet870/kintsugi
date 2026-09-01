import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FloatingParticles } from '@/components/animated/FloatingParticles'
import type { BreathingPhase } from '../hooks/useBreathingCycle'

export interface BreathingCircleProps {
  phase: BreathingPhase
  progress: number
  className?: string
}

export const BreathingCircle: React.FC<BreathingCircleProps> = React.memo(
  ({ phase, progress, className = '' }) => {
    /* 1. Calculate continuous scale behavior driven by hook progress (0.6 -> 1.0 -> 0.6) */
    const circleScale = useMemo(() => {
      if (phase === 'inhale') {
        return 0.6 + progress * 0.4 // 0.6 -> 1.0
      }
      if (phase === 'hold') {
        return 1.0 // Hold size
      }
      if (phase === 'exhale') {
        return 1.0 - progress * 0.4 // 1.0 -> 0.6
      }
      return 0.6
    }, [phase, progress])

    /* SVG Ring stroke dashoffset calculation for 283 circumference */
    const strokeDashoffset = 283 * (1 - progress)

    return (
      <div
        className={`relative flex items-center justify-center w-72 h-72 sm:w-96 sm:h-96 mx-auto select-none ${className}`}
        role="img"
        aria-label={`Breathing visualization: ${phase} phase`}
      >
        {/* Subtle Ambient Floating Particles Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full opacity-60">
          <FloatingParticles count={14} />
        </div>

        {/* Outer Glowing Kintsugi Gold Halo Radial Gradient */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl opacity-50 pointer-events-none"
          style={{
            background:
              phase === 'inhale'
                ? 'radial-gradient(circle, rgba(255, 216, 107, 0.6) 0%, rgba(246, 196, 83, 0.3) 50%, rgba(124, 58, 237, 0.15) 80%, transparent 100%)'
                : phase === 'hold'
                  ? 'radial-gradient(circle, rgba(246, 196, 83, 0.7) 0%, rgba(212, 175, 55, 0.4) 60%, rgba(124, 58, 237, 0.2) 85%, transparent 100%)'
                  : 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(255, 216, 107, 0.2) 60%, transparent 100%)',
            scale: circleScale * 0.95,
          }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />

        {/* Central SVG Scalable Kintsugi Gold Orb */}
        <motion.div
          className="relative z-10 w-52 h-52 sm:w-64 sm:h-64 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/20"
          style={{ scale: circleScale }}
          transition={{ duration: 0.05, ease: 'linear' }}
        >
          <svg className="w-full h-full drop-shadow-xl" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="kintsugiGoldGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFD86B" stopOpacity="0.9" />
                <stop offset="65%" stopColor="#F6C453" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.4" />
              </radialGradient>
              <radialGradient id="kintsugiInnerGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF2C2" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#F6C453" stopOpacity="0.1" />
              </radialGradient>
            </defs>

            {/* Outer Soft Gold Body Circle */}
            <circle cx="50" cy="50" r="44" fill="url(#kintsugiGoldGradient)" />

            {/* Inner Glowing Core */}
            <circle cx="50" cy="50" r="28" fill="url(#kintsugiInnerGlow)" />
          </svg>

          {/* Phase Badge Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm sm:text-base font-serif font-bold uppercase tracking-widest text-zinc-950 drop-shadow-sm px-3 py-1 bg-amber-200/40 rounded-full backdrop-blur-sm border border-amber-300/60">
              {phase === 'inhale' ? 'Inhale' : phase === 'hold' ? 'Hold' : 'Exhale'}
            </span>
          </div>
        </motion.div>

        {/* Circular SVG Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-20" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            className="stroke-zinc-800/40 fill-none stroke-[2]"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            className="stroke-amber-400 fill-none stroke-[2.5] transition-all duration-75"
            strokeDasharray="283"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
      </div>
    )
  },
)

BreathingCircle.displayName = 'BreathingCircle'

export default BreathingCircle
