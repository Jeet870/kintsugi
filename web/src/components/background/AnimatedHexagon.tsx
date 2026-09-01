import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export const AnimatedHexagon: React.FC = React.memo(() => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10 select-none">
      <motion.svg
        className="absolute top-1/3 right-10 w-48 h-48 text-violet-500"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        animate={!shouldReduceMotion ? { rotate: 360 } : undefined}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <polygon points="50 3, 93 25, 93 75, 50 97, 7 75, 7 25" />
      </motion.svg>
    </div>
  )
})

AnimatedHexagon.displayName = 'AnimatedHexagon'
export default AnimatedHexagon
