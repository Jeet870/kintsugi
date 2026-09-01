import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface LoadingProgressProps {
  progress?: number
  indeterminate?: boolean
  className?: string
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  progress = 0,
  indeterminate = true,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  return (
    <div className={`w-48 sm:w-64 h-1.5 bg-muted border border-border rounded-full overflow-hidden relative shadow-inner ${className}`}>
      {indeterminate ? (
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] via-violet-500 to-purple-600 shadow-[0_0_12px_rgba(212,175,55,0.4)]"
          initial={isAnimated ? { x: '-100%', width: '40%' } : { x: '0%', width: '100%' }}
          animate={
            isAnimated
              ? {
                  x: ['-100%', '250%'],
                }
              : undefined
          }
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ) : (
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] via-violet-500 to-purple-600 shadow-[0_0_12px_rgba(212,175,55,0.4)] transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      )}
    </div>
  )
}

export default LoadingProgress
