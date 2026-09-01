import { motion, useReducedMotion } from 'framer-motion'

export interface AppLogoProps {
  size?: number
  animated?: boolean
  showText?: boolean
  className?: string
}

export function AppLogo({
  size = 48,
  animated = true,
  showText = false,
  className = '',
}: AppLogoProps) {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = animated && !shouldReduceMotion

  return (
    <div
      role="img"
      aria-label="Kintsugi Logo"
      className={`inline-flex items-center gap-3 select-none group shrink-0 ${className}`}
      style={{ width: showText ? 'auto' : `${size}px`, height: `${size}px` }}
    >
      {/* Icon with Glowing Hover Animation */}
      <motion.div
        className="relative flex items-center justify-center shrink-0 cursor-pointer"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
        }}
        whileHover={isAnimated ? { scale: 1.08 } : undefined}
        whileTap={isAnimated ? { scale: 0.94 } : undefined}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            minWidth: `${size}px`,
            minHeight: `${size}px`,
          }}
          className="shrink-0 overflow-visible transition-all duration-300 drop-shadow-[0_4px_20px_rgba(124,58,237,0.45)] group-hover:drop-shadow-[0_0_24px_rgba(168,85,247,0.75)]"
        >
          <defs>
            {/* Main AI Purple Gradient */}
            <linearGradient
              id="kintsugi-ai-purple-1"
              x1="0"
              y1="0"
              x2="100"
              y2="100"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="60%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#6D28D9" />
            </linearGradient>

            {/* Accent Vibrant Purple Gradient */}
            <linearGradient
              id="kintsugi-ai-purple-2"
              x1="100"
              y1="0"
              x2="0"
              y2="100"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>

            {/* Kintsugi Gold Fill Gradient */}
            <linearGradient
              id="kintsugi-gold-fill"
              x1="20"
              y1="20"
              x2="80"
              y2="80"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="40%" stopColor="#F4C542" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Gold Glow Filter */}
            <filter id="gold-core-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Organic Purple Petal Star */}
          <path
            d="M 50,6 C 50,30 30,50 6,50 C 30,50 50,70 50,94 C 50,70 70,50 94,50 C 70,50 50,30 50,6 Z"
            fill="url(#kintsugi-ai-purple-1)"
          />

          {/* Interlocking Vibrant Purple Inner Star */}
          <path
            d="M 50,14 C 50,34 34,50 14,50 C 34,50 50,66 50,86 C 50,66 66,50 86,50 C 66,50 50,34 50,14 Z"
            fill="url(#kintsugi-ai-purple-2)"
            opacity="0.9"
          />

          {/* Center Golden Kintsugi Core Spark (The Mending Healing Heart) */}
          <motion.path
            d="M 50,22 C 50,38 38,50 22,50 C 38,50 50,62 50,78 C 50,62 62,50 78,50 C 62,50 50,38 50,22 Z"
            fill="url(#kintsugi-gold-fill)"
            filter="url(#gold-core-glow)"
            initial={isAnimated ? { scale: 0.9, opacity: 0.8 } : undefined}
            animate={isAnimated ? { scale: [0.9, 1.05, 0.95, 1], opacity: 1 } : undefined}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
          />

          {/* Inner Bright White Core Point */}
          <circle cx="50" cy="50" r="4.5" fill="#FAFAFA" />
        </svg>
      </motion.div>

      {/* Completely Static Brand Heading Text */}
      {showText && (
        <span
          className="font-bold tracking-tight text-foreground transition-colors duration-250"
          style={{ fontSize: Math.max(20, size * 0.52) }}
        >
          Kintsugi
        </span>
      )}
    </div>
  )
}

export default AppLogo
