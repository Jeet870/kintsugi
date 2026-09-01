import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/* ─── Types ─── */
export interface HexagonBackgroundProps {
  density?: 'low' | 'medium' | 'high'
  animated?: boolean
  className?: string
}

interface HexCell {
  id: string
  x: number
  y: number
  borderColor: string
  fillColor: string
  glowType: 'none' | 'purple' | 'gold'
  animDuration: number
  animDelay: number
}

interface FloatingLight {
  id: string
  x: string
  y: string
  size: number
  isPurple: boolean
  duration: number
  delay: number
  driftX: number
  driftY: number
}

/* ─── Deterministic pseudo-random seeded hash (no Math.random) ─── */
const seededRand = (a: number, b: number): number => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/* ─── Hexagon clip-path (flat-top orientation) ─── */
const HEX_CLIP = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'

/* ─── Hex cell size constants ─── */
const HEX_W = 60
const HEX_H = 52

/* ─── Component ─── */
export const HexagonBackground: React.FC<HexagonBackgroundProps> = React.memo(
  ({ density = 'medium', animated = true, className = '' }) => {
    const shouldReduceMotion = useReducedMotion()
    const isAnimated = animated && !shouldReduceMotion

    /* ═══════════════════════════════════════════════
       Layer 2 & 3 — Honeycomb hexagon grid
       Covers a virtual area larger than any viewport
       so it tiles edge-to-edge without centering gaps.
       ═══════════════════════════════════════════════ */
    const hexagons = useMemo<HexCell[]>(() => {
      // Scale multiplier controls how many hexagons we generate
      const densityScale = { low: 0.7, medium: 1.0, high: 1.4 }
      const scale = densityScale[density] ?? 1.0

      // Generate enough hexagons to cover a 2560×1600 viewport
      // (covers 4K and below — extras are clipped by overflow:hidden)
      const coverW = 2800
      const coverH = 1800

      const hGap = HEX_W * 0.75 * (1 / scale) // horizontal distance between columns
      const vGap = HEX_H * (1 / scale)          // vertical distance between rows
      const cols = Math.ceil(coverW / hGap) + 2
      const rows = Math.ceil(coverH / vGap) + 2

      const cells: HexCell[] = []

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const isOddCol = col % 2 === 1
          const x = col * hGap
          const y = row * vGap + (isOddCol ? vGap * 0.5 : 0)

          const r = seededRand(col, row)

          // ~15% purple glow, ~8% gold glow, rest default
          let glowType: HexCell['glowType'] = 'none'
          let borderColor = 'rgba(124,58,237,0.07)'
          let fillColor = 'transparent'

          if (r < 0.15) {
            glowType = 'purple'
            borderColor = 'rgba(124,58,237,0.18)'
            fillColor = 'rgba(124,58,237,0.05)'
          } else if (r > 0.92) {
            glowType = 'gold'
            borderColor = 'rgba(212,175,55,0.18)'
            fillColor = 'rgba(212,175,55,0.04)'
          }

          const animDuration = 8 + r * 12          // 8–20s
          const animDelay = seededRand(row, col) * 8 // 0–8s

          cells.push({
            id: `h${col}_${row}`,
            x,
            y,
            borderColor,
            fillColor,
            glowType,
            animDuration,
            animDelay,
          })
        }
      }

      return cells
    }, [density])

    /* ═══════════════════════════════════════════════
       Layer 4 — Floating ambient lights
       ═══════════════════════════════════════════════ */
    const floatingLights = useMemo<FloatingLight[]>(() => {
      return Array.from({ length: 14 }, (_, i) => {
        const r1 = seededRand(i, 99)
        const r2 = seededRand(99, i)
        return {
          id: `fl_${i}`,
          x: `${(r1 * 90 + 5).toFixed(1)}%`,
          y: `${(r2 * 85 + 5).toFixed(1)}%`,
          size: 180 + r1 * 320,
          isPurple: i % 3 !== 0,
          duration: 28 + r2 * 22,
          delay: r1 * 10,
          driftX: (r2 - 0.5) * 60,
          driftY: (r1 - 0.5) * 50,
        }
      })
    }, [])

    return (
      <div
        aria-hidden="true"
        className={`fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none bg-background ${className}`}
      >
        {/* ═══════════════════════════════════════════════
            LAYER 1 — Deep radial gradient orbs
            3 blurred gradient spheres that breathe slowly
            ═══════════════════════════════════════════════ */}
        <motion.div
          className="absolute -top-[20%] left-[15%] w-[900px] h-[700px] rounded-full opacity-50"
          style={{
            background:
              'radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(139,92,246,0.10) 40%, transparent 70%)',
            filter: 'blur(120px)',
          }}
          animate={
            isAnimated
              ? {
                  scale: [1, 1.15, 1.05, 1],
                  x: [0, 40, -20, 0],
                  y: [0, 30, -10, 0],
                  opacity: [0.45, 0.65, 0.5, 0.45],
                }
              : undefined
          }
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute -bottom-[15%] -right-[5%] w-[750px] h-[650px] rounded-full opacity-40"
          style={{
            background:
              'radial-gradient(circle, rgba(79,70,229,0.15) 0%, rgba(124,58,237,0.08) 45%, transparent 70%)',
            filter: 'blur(130px)',
          }}
          animate={
            isAnimated
              ? {
                  scale: [1, 1.1, 1.18, 1],
                  x: [0, -30, 15, 0],
                  opacity: [0.35, 0.55, 0.4, 0.35],
                }
              : undefined
          }
          transition={{
            duration: 55,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute top-[40%] left-[50%] w-[600px] h-[500px] rounded-full opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(212,175,55,0.08) 0%, rgba(124,58,237,0.05) 50%, transparent 75%)',
            filter: 'blur(100px)',
          }}
          animate={
            isAnimated
              ? {
                  scale: [1, 1.2, 1],
                  x: ['-50%', '-45%', '-55%', '-50%'],
                  opacity: [0.25, 0.4, 0.3, 0.25],
                }
              : undefined
          }
          transition={{
            duration: 38,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* ═══════════════════════════════════════════════
            LAYER 2 & 3 — Honeycomb hexagon grid
            Flat-top hexagons with CSS clip-path borders.
            Animated glow subset uses transform + opacity.
            ═══════════════════════════════════════════════ */}
        <div className="absolute inset-0 opacity-80">
          {hexagons.map((hex) => {
            const shouldAnimate = isAnimated && hex.glowType !== 'none'

            return (
              <motion.div
                key={hex.id}
                className="absolute will-change-[transform,opacity]"
                style={{
                  width: HEX_W,
                  height: HEX_H,
                  left: hex.x,
                  top: hex.y,
                }}
                animate={
                  shouldAnimate
                    ? {
                        scale: [1, 1.08, 1],
                        opacity: [0.5, 1, 0.5],
                      }
                    : undefined
                }
                transition={{
                  duration: hex.animDuration,
                  repeat: Infinity,
                  delay: hex.animDelay,
                  ease: 'easeInOut',
                }}
              >
                {/* Outer shape = border color */}
                <div
                  className="w-full h-full"
                  style={{
                    clipPath: HEX_CLIP,
                    backgroundColor: hex.borderColor,
                  }}
                >
                  {/* Inner shape = fill — inset by 1px to reveal border */}
                  <div
                    className="absolute inset-[1px]"
                    style={{
                      clipPath: HEX_CLIP,
                      backgroundColor: hex.fillColor,
                    }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ═══════════════════════════════════════════════
            LAYER 4 — Floating ambient light orbs
            Slow drifting blurred circles at very low opacity
            ═══════════════════════════════════════════════ */}
        {floatingLights.map((light) => (
          <motion.div
            key={light.id}
            className="absolute rounded-full"
            style={{
              top: light.y,
              left: light.x,
              width: light.size,
              height: light.size,
              background: light.isPurple
                ? 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
            animate={
              isAnimated
                ? {
                    x: [0, light.driftX, -light.driftX * 0.6, 0],
                    y: [0, light.driftY, -light.driftY * 0.4, 0],
                    opacity: [0.04, 0.08, 0.05, 0.04],
                  }
                : undefined
            }
            transition={{
              duration: light.duration,
              repeat: Infinity,
              delay: light.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* ═══════════════════════════════════════════════
            LAYER 5 — Noise grain overlay (CSS only, no image)
            ═══════════════════════════════════════════════ */}
        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat',
          }}
        />

        {/* ═══════════════════════════════════════════════
            LAYER 6 — Glass shine sweep
            A diagonal linear-gradient that drifts across
            the viewport at very low opacity
            ═══════════════════════════════════════════════ */}
        <motion.div
          className="absolute top-0 left-0 w-[200%] h-full"
          style={{
            background:
              'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.012) 45%, rgba(255,255,255,0.025) 50%, rgba(255,255,255,0.012) 55%, transparent 70%)',
          }}
          animate={
            isAnimated
              ? {
                  x: ['-100%', '50%'],
                }
              : undefined
          }
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
            repeatDelay: 8,
          }}
        />
      </div>
    )
  }
)

HexagonBackground.displayName = 'HexagonBackground'
export default HexagonBackground
