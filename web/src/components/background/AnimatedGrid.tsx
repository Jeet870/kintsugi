import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export const AnimatedGrid: React.FC = React.memo(() => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 select-none">
      <motion.div
        className="w-full h-[200%] bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]"
        animate={!shouldReduceMotion ? { y: [0, -64] } : undefined}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
})

AnimatedGrid.displayName = 'AnimatedGrid'
export default AnimatedGrid
