import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/* ─── Design Tokens ─── */
const GOLD_PALETTE = ['#FFD166', '#F4C542', '#FFE08A'] as const
const PARTICLE_OPACITY_MIN = 0.08
const PARTICLE_OPACITY_MAX = 0.25
const DRIFT_RANGE = 20

/* ─── Types ─── */
interface Particle {
  readonly id: number
  readonly size: number
  readonly opacity: number
  readonly delay: number
  readonly duration: number
  readonly startX: number
  readonly driftAmount: number
  readonly blur: 0 | 1 | 2
  readonly color: string
}

export interface FloatingParticlesProps {
  /** Additional CSS classes on the container */
  className?: string
  /** Number of particles to render */
  count?: number
  /** Minimum particle diameter in pixels */
  minSize?: number
  /** Maximum particle diameter in pixels */
  maxSize?: number
  /** Minimum float duration in seconds */
  minDuration?: number
  /** Maximum float duration in seconds */
  maxDuration?: number
  /** Enable subtle mouse parallax (max 8px shift) */
  interactive?: boolean
}

/* ─── Deterministic pseudo-random seeded generator ─── */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49999
  return x - Math.floor(x)
}

function lerp(min: number, max: number, t: number): number {
  return min + (max - min) * t
}

/* ─── Particle factory ─── */
function generateParticles(
  count: number,
  minSize: number,
  maxSize: number,
  minDuration: number,
  maxDuration: number,
): readonly Particle[] {
  const particles: Particle[] = []

  for (let i = 0; i < count; i++) {
    const r1 = seededRandom(i * 7 + 1)
    const r2 = seededRandom(i * 13 + 3)
    const r3 = seededRandom(i * 19 + 5)
    const r4 = seededRandom(i * 31 + 7)
    const r5 = seededRandom(i * 43 + 11)
    const r6 = seededRandom(i * 53 + 17)

    const blurLevels: Array<0 | 1 | 2> = [0, 0, 1, 1, 2]

    particles.push({
      id: i,
      size: lerp(minSize, maxSize, r1),
      opacity: lerp(PARTICLE_OPACITY_MIN, PARTICLE_OPACITY_MAX, r2),
      delay: lerp(0, maxDuration * 0.6, r3),
      duration: lerp(minDuration, maxDuration, r4),
      startX: r5 * 100,
      driftAmount: lerp(-DRIFT_RANGE, DRIFT_RANGE, r6),
      blur: blurLevels[Math.floor(r1 * blurLevels.length)]!,
      color: GOLD_PALETTE[Math.floor(r2 * GOLD_PALETTE.length)]!,
    })
  }

  return particles
}

/* ─── Blur class map ─── */
const BLUR_CLASS: Record<0 | 1 | 2, string> = {
  0: '',
  1: 'blur-sm',
  2: 'blur-md',
}

/* ─── Component ─── */
export const FloatingParticles: React.FC<FloatingParticlesProps> = React.memo(
  ({
    className = '',
    count = 10,
    minSize = 2,
    maxSize = 6,
    minDuration = 18,
    maxDuration = 35,
    interactive = false,
  }) => {
    const shouldReduceMotion = useReducedMotion()

    const particles = useMemo(
      () => generateParticles(count, minSize, maxSize, minDuration, maxDuration),
      [count, minSize, maxSize, minDuration, maxDuration],
    )

    /* Reduced motion — render nothing */
    if (shouldReduceMotion) return null

    return (
      <div
        aria-hidden="true"
        role="presentation"
        className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}
      >
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute rounded-full ${BLUR_CLASS[p.blur]}`}
            style={{
              width: p.size,
              height: p.size,
              left: `${p.startX}%`,
              backgroundColor: p.color,
              willChange: 'transform, opacity',
            }}
            initial={{
              y: '110%',
              opacity: 0,
              scale: 1,
              x: 0,
            }}
            animate={{
              y: '-20%',
              opacity: [0, p.opacity * 0.6, p.opacity, p.opacity * 0.6, 0],
              scale: [1, 1.1, 0.95, 1],
              x: [
                0,
                p.driftAmount,
                -p.driftAmount * 0.75,
                p.driftAmount * 0.6,
                0,
              ],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Optional interactive parallax layer */}
        {interactive && <ParallaxLayer />}
      </div>
    )
  },
)

FloatingParticles.displayName = 'FloatingParticles'

/* ─── Parallax sub-layer (only mounted when interactive=true) ─── */
const PARALLAX_MAX = 8

const ParallaxLayer: React.FC = React.memo(() => {
  const handleMouseMove = useMemo(
    () => (e: React.MouseEvent<HTMLDivElement>) => {
      const el = e.currentTarget
      const rect = el.getBoundingClientRect()
      const xRatio = (e.clientX - rect.left) / rect.width - 0.5
      const yRatio = (e.clientY - rect.top) / rect.height - 0.5
      el.style.transform = `translate(${xRatio * PARALLAX_MAX}px, ${yRatio * PARALLAX_MAX}px)`
    },
    [],
  )

  const handleMouseLeave = useMemo(
    () => (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.transform = 'translate(0px, 0px)'
    },
    [],
  )

  return (
    <div
      className="absolute inset-0 pointer-events-auto"
      style={{ transition: 'transform 0.6s ease-out' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  )
})

ParallaxLayer.displayName = 'ParallaxLayer'

export default FloatingParticles
