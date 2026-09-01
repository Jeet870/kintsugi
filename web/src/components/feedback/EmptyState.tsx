import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/* ─── Size Spacing Map ─── */
const SIZE_CONFIG = {
  sm: { px: 'px-6', py: 'py-8', gap: 'gap-4', title: 'text-base', icon: 48 },
  md: { px: 'px-8', py: 'py-12', gap: 'gap-5', title: 'text-xl', icon: 64 },
  lg: { px: 'px-10', py: 'py-16', gap: 'gap-6', title: 'text-2xl', icon: 72 },
} as const

type EmptyStateSize = keyof typeof SIZE_CONFIG

/* ─── Animation Constants ─── */
const CONTAINER_TRANSITION = { duration: 0.4, ease: 'easeOut' as const }
const FLOAT_TRANSITION = {
  duration: 6,
  repeat: Infinity,
  repeatType: 'mirror' as const,
  ease: 'easeInOut' as const,
}

/* ─── Props ─── */
export interface EmptyStateProps {
  /** Optional icon element displayed inside a tinted circle */
  icon?: React.ReactNode
  /** Primary heading text */
  title: string
  /** Supporting description text */
  description: string
  /** Optional call-to-action (button, link, etc.) — owned by the parent */
  action?: React.ReactNode
  /** Optional illustration rendered above the icon */
  illustration?: React.ReactNode
  /** Additional CSS classes on the container */
  className?: string
  /** Size variant controlling spacing and typography */
  size?: EmptyStateSize
  /** Enable entrance and idle animations */
  animate?: boolean
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(
  ({
    icon,
    title,
    description,
    action,
    illustration,
    className = '',
    size = 'md',
    animate = true,
  }) => {
    const shouldReduceMotion = useReducedMotion()
    const isAnimated = animate && !shouldReduceMotion
    const config = SIZE_CONFIG[size] ?? SIZE_CONFIG.md

    const Container = isAnimated ? motion.section : 'section'
    const IconWrapper = isAnimated ? motion.div : 'div'

    const containerProps = isAnimated
      ? {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: CONTAINER_TRANSITION,
        }
      : {}

    const iconMotionProps = isAnimated
      ? {
          animate: { y: [0, -4, 0] },
          transition: FLOAT_TRANSITION,
        }
      : {}

    return (
      <Container
        {...containerProps}
        className={[
          'flex flex-col items-center justify-center text-center',
          'rounded-3xl border border-border bg-card/60 text-card-foreground backdrop-blur-md shadow-xs transition-colors duration-250',
          config.px,
          config.py,
          config.gap,
          className,
        ].join(' ')}
      >
        {/* Optional illustration */}
        {illustration && (
          <div aria-hidden="true">{illustration}</div>
        )}

        {/* Icon circle */}
        {icon && (
          <IconWrapper
            {...iconMotionProps}
            aria-hidden="true"
            className="flex items-center justify-center rounded-full bg-amber-500/10 p-5 text-amber-500 dark:text-amber-400"
            style={{
              width: config.icon,
              height: config.icon,
            }}
          >
            {icon}
          </IconWrapper>
        )}

        {/* Title */}
        <h2
          className={`font-semibold tracking-tight text-foreground ${config.title}`}
        >
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm leading-relaxed text-muted-foreground max-w-md">
          {description}
        </p>

        {/* Optional action slot */}
        {action && <div className="pt-1">{action}</div>}
      </Container>
    )
  },
)

EmptyState.displayName = 'EmptyState'

export default EmptyState
