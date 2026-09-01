import React, { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

/* ─── Design Tokens ─── */
const GOLD_START = '#F4C542'
const GOLD_MID = '#FFD166'
const GOLD_END = '#F8E08A'

/* ─── Animation Timing ─── */
const DRAW_DURATION = 0.9
const GLOW_PULSE_DURATION = 5

/* ─── Handcrafted Kintsugi Repair Seam Path ─── */
const SEAM_PATH =
  'M 0 30 C 60 24, 120 38, 200 28 C 280 18, 340 36, 440 32 ' +
  'C 520 28, 580 22, 660 34 C 740 44, 800 26, 880 30 ' +
  'C 940 34, 1000 20, 1080 28 C 1140 34, 1180 30, 1200 32'

/* ─── Small Branch Path (visual depth) ─── */
const BRANCH_PATH =
  'M 440 32 C 470 42, 510 48, 540 40'

export interface KintsugiCrackDividerProps {
  /** Additional CSS classes on the container */
  className?: string
  /** Enable scroll-triggered drawing animation */
  animate?: boolean
  /** Show subtle gold glow behind the seam */
  showGlow?: boolean
  /** SVG stroke width of the repair seam */
  strokeWidth?: number
  /** Component height in pixels */
  height?: number
}

export const KintsugiCrackDivider: React.FC<KintsugiCrackDividerProps> = React.memo(
  ({
    className = '',
    animate = true,
    showGlow = true,
    strokeWidth = 2.5,
    height = 48,
  }) => {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, amount: 0.2 })
    const shouldReduceMotion = useReducedMotion()
    const isAnimated = animate && !shouldReduceMotion

    const shouldDraw = isAnimated && isInView
    const shouldPulse = isAnimated && isInView && showGlow

    return (
      <div
        ref={ref}
        aria-hidden="true"
        role="presentation"
        className={`w-full pointer-events-none select-none ${className}`}
        style={{ height }}
      >
        <motion.svg
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          focusable={false}
          className="w-full h-full"
          whileHover={isAnimated ? { scaleY: 1.03 } : undefined}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <defs>
            {/* Gold repair seam gradient */}
            <linearGradient id="kintsugiDividerGold" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor={GOLD_START} />
              <stop offset="50%" stopColor={GOLD_MID} />
              <stop offset="100%" stopColor={GOLD_END} />
            </linearGradient>

            {/* Soft glow blur filter */}
            <filter id="kintsugiDividerGlow" x="-10%" y="-60%" width="120%" height="220%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Glow layer — rendered behind the main seam */}
          {showGlow && (
            <motion.path
              d={SEAM_PATH}
              stroke="url(#kintsugiDividerGold)"
              strokeWidth={strokeWidth + 4}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#kintsugiDividerGlow)"
              initial={{ pathLength: isAnimated ? 0 : 1, opacity: 0 }}
              animate={
                shouldPulse
                  ? {
                      pathLength: 1,
                      opacity: [0.1, 0.18, 0.1],
                    }
                  : shouldDraw
                    ? { pathLength: 1, opacity: 0.12 }
                    : isAnimated
                      ? undefined
                      : { pathLength: 1, opacity: 0.12 }
              }
              transition={{
                pathLength: { duration: DRAW_DURATION, ease: 'easeInOut' },
                opacity: {
                  duration: GLOW_PULSE_DURATION,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                  delay: DRAW_DURATION,
                },
              }}
            />
          )}

          {/* Primary repair seam */}
          <motion.path
            d={SEAM_PATH}
            stroke="url(#kintsugiDividerGold)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={isAnimated ? { pathLength: 0, opacity: 0 } : undefined}
            animate={
              shouldDraw
                ? { pathLength: 1, opacity: 1 }
                : isAnimated
                  ? undefined
                  : { pathLength: 1, opacity: 1 }
            }
            transition={{
              pathLength: { duration: DRAW_DURATION, ease: 'easeInOut' },
              opacity: { duration: DRAW_DURATION * 0.5, ease: 'easeIn' },
            }}
          />

          {/* Small branch for organic depth */}
          <motion.path
            d={BRANCH_PATH}
            stroke="url(#kintsugiDividerGold)"
            strokeWidth={strokeWidth * 0.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.5}
            initial={isAnimated ? { pathLength: 0, opacity: 0 } : undefined}
            animate={
              shouldDraw
                ? { pathLength: 1, opacity: 0.5 }
                : isAnimated
                  ? undefined
                  : { pathLength: 1, opacity: 0.5 }
            }
            transition={{
              pathLength: {
                duration: DRAW_DURATION * 0.6,
                ease: 'easeInOut',
                delay: DRAW_DURATION * 0.5,
              },
              opacity: {
                duration: DRAW_DURATION * 0.4,
                ease: 'easeIn',
                delay: DRAW_DURATION * 0.5,
              },
            }}
          />
        </motion.svg>
      </div>
    )
  }
)

KintsugiCrackDivider.displayName = 'KintsugiCrackDivider'

export default KintsugiCrackDivider
