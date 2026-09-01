import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/* ─── Design Tokens ─── */
const PURPLE_PRIMARY = '#7C3AED'
const PURPLE_SECONDARY = '#8B5CF6'
const GOLD_SOFT = '#FFD166'

/* ─── Animation Durations (seconds) ─── */
const REVEAL_DURATION = 4
const DRIFT_DURATION = 75
const GLOW_PULSE_DURATION = 25
const ORB_DRIFT_SLOW = 55
const ORB_DRIFT_MEDIUM = 70

/* ─── Kintsugi Crack Path Definitions ─── */
interface CrackPath {
  readonly id: string
  readonly d: string
  readonly strokeWidth: number
  readonly opacity: number
}

const CRACK_PATHS: readonly CrackPath[] = [
  {
    id: 'seam-primary',
    d: 'M -40 180 C 180 260, 380 140, 580 320 C 740 440, 820 340, 1020 520 C 1180 660, 1380 560, 1560 720',
    strokeWidth: 1.6,
    opacity: 0.12,
  },
  {
    id: 'seam-branch-a',
    d: 'M 580 320 C 480 440, 420 580, 300 720 C 200 830, 140 920, -10 1060',
    strokeWidth: 1.1,
    opacity: 0.08,
  },
  {
    id: 'seam-secondary',
    d: 'M 1960 -30 C 1720 200, 1500 330, 1260 240 C 1060 170, 880 380, 720 510 C 540 650, 400 800, 160 1100',
    strokeWidth: 2.0,
    opacity: 0.1,
  },
  {
    id: 'seam-branch-b',
    d: 'M 1260 240 C 1380 400, 1520 550, 1700 660 C 1840 750, 1960 830, 2060 950',
    strokeWidth: 0.9,
    opacity: 0.06,
  },
  {
    id: 'seam-tertiary',
    d: 'M 340 1080 C 560 920, 780 800, 1020 870 C 1220 930, 1440 820, 1700 1000',
    strokeWidth: 1.3,
    opacity: 0.09,
  },
  {
    id: 'seam-branch-c',
    d: 'M 1020 870 C 1080 740, 1200 620, 1360 480',
    strokeWidth: 0.8,
    opacity: 0.05,
  },
] as const

/**
 * AnimatedBackground — Global decorative backdrop layer.
 *
 * Renders a 4-layer atmospheric canvas:
 *   1. Solid #09090B base
 *   2. Slow-drifting radial ambient glows (purple + gold, 5–10% opacity)
 *   3. Handcrafted SVG Kintsugi gold-seam crack pattern
 *   4. Micro-noise texture overlay (2% opacity)
 *
 * Uses `fixed inset-0 -z-50` so it sits behind all page content.
 * Content layers above must NOT use solid opaque backgrounds.
 */
export const AnimatedBackground: React.FC = React.memo(() => {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion
  const paths = useMemo(() => CRACK_PATHS, [])

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className="fixed inset-0 overflow-hidden pointer-events-none bg-background transition-colors duration-300"
      style={{ zIndex: -50 }}
    >
      {/* ── LAYER 2: Radial Ambient Glow Orbs ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '-18%',
          left: '-8%',
          width: '60vw',
          height: '60vw',
          background: `radial-gradient(circle, ${PURPLE_PRIMARY} 0%, transparent 70%)`,
          opacity: 0.07,
          filter: 'blur(120px)',
        }}
        animate={
          isAnimated
            ? { x: [0, 30, -20, 0], y: [0, -20, 30, 0] }
            : undefined
        }
        transition={{ duration: ORB_DRIFT_SLOW, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          bottom: '-22%',
          right: '-10%',
          width: '65vw',
          height: '65vw',
          background: `radial-gradient(circle, ${PURPLE_SECONDARY} 0%, transparent 70%)`,
          opacity: 0.06,
          filter: 'blur(140px)',
        }}
        animate={
          isAnimated
            ? { x: [0, -35, 25, 0], y: [0, 30, -25, 0] }
            : undefined
        }
        transition={{ duration: ORB_DRIFT_MEDIUM, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          top: '35%',
          left: '25%',
          width: '40vw',
          height: '40vw',
          background: `radial-gradient(circle, ${GOLD_SOFT} 0%, transparent 70%)`,
          opacity: 0.04,
          filter: 'blur(160px)',
        }}
        animate={
          isAnimated
            ? { opacity: [0.03, 0.06, 0.03] }
            : undefined
        }
        transition={{ duration: GLOW_PULSE_DURATION, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── LAYER 3: Kintsugi Gold Seam Crack Pattern ── */}
      <motion.svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        animate={
          isAnimated
            ? { x: [-8, 8, -8], y: [-6, 6, -6] }
            : undefined
        }
        transition={{ duration: DRIFT_DURATION, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD166" />
            <stop offset="50%" stopColor="#F4C542" />
            <stop offset="100%" stopColor="#F8E08A" />
          </linearGradient>

          <filter id="seamGlow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {paths.map((path, i) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="url(#goldGradient)"
            strokeWidth={path.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#seamGlow)"
            initial={
              isAnimated
                ? { pathLength: 0, opacity: 0 }
                : { pathLength: 1, opacity: path.opacity }
            }
            animate={
              isAnimated
                ? {
                    pathLength: 1,
                    opacity: [path.opacity, path.opacity * 1.4, path.opacity],
                  }
                : undefined
            }
            transition={{
              pathLength: {
                duration: REVEAL_DURATION + i * 0.5,
                ease: 'easeInOut',
                delay: i * 0.3,
              },
              opacity: {
                duration: GLOW_PULSE_DURATION + i * 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: REVEAL_DURATION + i * 0.3,
              },
            }}
          />
        ))}
      </motion.svg>

      {/* ── LAYER 4: Micro Noise Texture ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.02, mixBlendMode: 'overlay' }}
      >
        <filter id="noiseTexture">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseTexture)" />
      </svg>
    </div>
  )
})

AnimatedBackground.displayName = 'AnimatedBackground'

export default AnimatedBackground
