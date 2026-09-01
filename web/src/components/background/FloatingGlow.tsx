import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export const FloatingGlow: React.FC = React.memo(() => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Purple Ambient Glow */}
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"
        animate={!shouldReduceMotion ? { y: [0, 40, 0], x: [0, 20, 0] } : undefined}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Warm Gold Accent Glow */}
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[140px]"
        animate={!shouldReduceMotion ? { y: [0, -30, 0], x: [0, -20, 0] } : undefined}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
})

FloatingGlow.displayName = 'FloatingGlow'
export default FloatingGlow
