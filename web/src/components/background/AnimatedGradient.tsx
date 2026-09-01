import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export const AnimatedGradient: React.FC = React.memo(() => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      aria-hidden="true"
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-radial from-purple-600/15 via-violet-900/10 to-transparent blur-3xl pointer-events-none"
      animate={
        !shouldReduceMotion
          ? {
              scale: [1, 1.1, 1],
              opacity: [0.35, 0.5, 0.35],
            }
          : undefined
      }
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
})

AnimatedGradient.displayName = 'AnimatedGradient'
export default AnimatedGradient
