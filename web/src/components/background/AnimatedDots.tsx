import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export const AnimatedDots: React.FC = React.memo(() => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 select-none">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-violet-400 rounded-full shadow-[0_0_8px_#8B5CF6]"
          style={{
            top: `${(i * 17) % 90}%`,
            left: `${(i * 23) % 95}%`,
          }}
          animate={
            !shouldReduceMotion
              ? {
                  y: [0, -20, 0],
                  opacity: [0.2, 0.7, 0.2],
                }
              : undefined
          }
          transition={{
            duration: 6 + (i % 4),
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
})

AnimatedDots.displayName = 'AnimatedDots'
export default AnimatedDots
