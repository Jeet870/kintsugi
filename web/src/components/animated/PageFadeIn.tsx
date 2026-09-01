import React from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

/* ─── Timing Constants ─── */
const ENTER_DURATION = 0.32
const EXIT_DURATION = 0.2

/* ─── Animation Variants ─── */
const PAGE_VARIANTS = {
  initial: {
    opacity: 0,
    y: 8,
    filter: 'blur(2px)',
  },
  enter: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: ENTER_DURATION,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    filter: 'blur(2px)',
    transition: {
      duration: EXIT_DURATION,
      ease: 'easeIn' as const,
    },
  },
} as const

/* ─── Reduced-motion: instant render, no animation ─── */
const STATIC_VARIANTS = {
  initial: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
  },
  enter: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0 },
  },
  exit: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0 },
  },
} as const

/* ─── Props ─── */
export interface PageFadeInProps {
  /** Routed page content (typically <Outlet />) */
  children: React.ReactNode
  /** Additional CSS classes on the motion wrapper */
  className?: string
}

export const PageFadeIn: React.FC<PageFadeInProps> = React.memo(
  ({ children, className = '' }) => {
    const location = useLocation()
    const shouldReduceMotion = useReducedMotion()

    const variants = shouldReduceMotion ? STATIC_VARIANTS : PAGE_VARIANTS

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={variants}
          initial="initial"
          animate="enter"
          exit="exit"
          className={`w-full min-h-full relative ${className}`}
          style={{ willChange: 'transform, opacity, filter' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    )
  },
)

PageFadeIn.displayName = 'PageFadeIn'

export default PageFadeIn
