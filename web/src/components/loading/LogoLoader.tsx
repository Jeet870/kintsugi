import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface LogoLoaderProps {
  size?: number
  animated?: boolean
  className?: string
}

export const LogoLoader: React.FC<LogoLoaderProps> = ({
  size = 110,
  animated = true,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = animated && !shouldReduceMotion

  /* Floating gold & purple rising energy particles */
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: `p_${i}`,
      size: 4 + (i % 3) * 2,
      x: (i - 5.5) * 16,
      yStart: 40 + (i % 4) * 8,
      yEnd: -50 - (i % 3) * 16,
      isGold: i % 2 === 0,
      duration: 2.8 + (i % 4) * 0.7,
      delay: i * 0.25,
    }))
  }, [])

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* ─── Layer 1: Ambient Purple & Gold Radial Breathing Glow ─── */}
      <motion.div
        className="absolute rounded-full bg-radial from-[#7C3AED]/45 via-[#8B5CF6]/25 to-transparent blur-3xl pointer-events-none"
        style={{ width: size * 2.2, height: size * 2.2 }}
        animate={
          isAnimated
            ? {
                scale: [1, 1.18, 0.95, 1],
                opacity: [0.45, 0.8, 0.5, 0.45],
              }
            : undefined
        }
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Gold Core Ambient Halo */}
      <motion.div
        className="absolute rounded-full bg-radial from-[#D4AF37]/35 via-[#F5D06F]/15 to-transparent blur-2xl pointer-events-none"
        style={{ width: size * 1.3, height: size * 1.3 }}
        animate={
          isAnimated
            ? {
                scale: [0.9, 1.25, 0.95, 0.9],
                opacity: [0.3, 0.7, 0.35, 0.3],
              }
            : undefined
        }
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* ─── Layer 2: Floating Rising Energy Particles ─── */}
      {isAnimated &&
        particles.map((p) => (
          <motion.span
            key={p.id}
            className={`absolute rounded-full ${
              p.isGold
                ? 'bg-[#F5D06F] shadow-[0_0_10px_#D4AF37]'
                : 'bg-[#C084FC] shadow-[0_0_10px_#A855F7]'
            }`}
            style={{
              width: p.size,
              height: p.size,
              x: p.x,
            }}
            initial={{ y: p.yStart, opacity: 0, scale: 0.5 }}
            animate={{
              y: [p.yStart, p.yEnd],
              opacity: [0, 0.95, 0],
              scale: [0.5, 1.3, 0.3],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeOut',
            }}
          />
        ))}

      {/* ─── Layer 3: Main Animated SVG Logo Container ─── */}
      <motion.div
        className="relative z-10 flex items-center justify-center cursor-pointer"
        style={{ width: size, height: size }}
        initial={isAnimated ? { scale: 0.8, opacity: 0 } : { scale: 1, opacity: 1 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible drop-shadow-[0_6px_28px_rgba(124,58,237,0.55)]"
        >
          <defs>
            {/* Outer Purple Gradient */}
            <linearGradient id="loader-purple-1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#5B21B6" />
            </linearGradient>

            {/* Inner Vibrant Violet Gradient */}
            <linearGradient id="loader-purple-2" x1="100" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E9D5FF" />
              <stop offset="50%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>

            {/* Gold Core Gradient */}
            <linearGradient id="loader-gold-core" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF59D" />
              <stop offset="40%" stopColor="#F5D06F" />
              <stop offset="85%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* Gold Glow Filter */}
            <filter id="loader-gold-glow-filter" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Outer Organic Purple Petal Star with Continuous Scale & Breathing */}
          <motion.path
            d="M 50,6 C 50,30 30,50 6,50 C 30,50 50,70 50,94 C 50,70 70,50 94,50 C 70,50 50,30 50,6 Z"
            fill="url(#loader-purple-1)"
            animate={
              isAnimated
                ? {
                    scale: [1, 1.05, 0.97, 1],
                  }
                : undefined
            }
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: '50px 50px' }}
          />

          {/* 2. Interlocking Inner Star with Continuous Slow Rotation */}
          <motion.path
            d="M 50,14 C 50,34 34,50 14,50 C 34,50 50,66 50,86 C 50,66 66,50 86,50 C 66,50 50,34 50,14 Z"
            fill="url(#loader-purple-2)"
            opacity="0.9"
            animate={
              isAnimated
                ? {
                    rotate: [0, 90, 180, 270, 360],
                    scale: [0.96, 1.03, 0.96],
                  }
                : undefined
            }
            transition={{
              rotate: { duration: 16, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ transformOrigin: '50px 50px' }}
          />

          {/* 3. Golden Kintsugi Core Spark (Mending Gold Seam) with Continuous Pulse */}
          <motion.path
            d="M 50,22 C 50,38 38,50 22,50 C 38,50 50,62 50,78 C 50,62 62,50 78,50 C 62,50 50,38 50,22 Z"
            fill="url(#loader-gold-core)"
            filter="url(#loader-gold-glow-filter)"
            animate={
              isAnimated
                ? {
                    scale: [0.9, 1.15, 0.95, 1],
                    opacity: [0.85, 1, 0.85],
                  }
                : undefined
            }
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: '50px 50px' }}
          />

          {/* 4. Continuous Gold Energy Stroke Ray Tracing Around Kintsugi Core */}
          {isAnimated && (
            <motion.path
              d="M 50,22 C 50,38 38,50 22,50 C 38,50 50,62 50,78 C 50,62 62,50 78,50 C 62,50 50,38 50,22 Z"
              stroke="#FFF59D"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0, pathOffset: 0 }}
              animate={{
                pathLength: [0.15, 0.4, 0.15],
                pathOffset: [0, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ transformOrigin: '50px 50px' }}
            />
          )}

          {/* 5. Center White Core Sparkle */}
          <motion.circle
            cx="50"
            cy="50"
            r="4.5"
            fill="#FFFFFF"
            animate={
              isAnimated
                ? {
                    scale: [0.8, 1.3, 0.8],
                    opacity: [0.7, 1, 0.7],
                  }
                : undefined
            }
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: '50px 50px' }}
          />
        </svg>
      </motion.div>
    </div>
  )
}

export default LogoLoader
