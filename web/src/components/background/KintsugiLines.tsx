import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export const KintsugiLines: React.FC = React.memo(() => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25 select-none">
      <svg
        className="w-full h-full"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="landingKintsugiGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#F5D06F" stopOpacity="1" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <motion.path
          d="M -100 200 C 300 150, 500 400, 900 350 C 1200 300, 1400 500, 1600 450"
          stroke="url(#landingKintsugiGold)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={!shouldReduceMotion ? { pathLength: 0 } : { pathLength: 1 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  )
})

KintsugiLines.displayName = 'KintsugiLines'
export default KintsugiLines
