import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface GlassCardProps {
  children: React.ReactNode
  className?: string
  accentColor?: 'purple' | 'gold' | 'emerald' | 'rose' | 'blue'
  hoverEffect?: boolean
}

const accentMap = {
  purple: 'hover:border-violet-500/50 hover:shadow-violet-500/10',
  gold: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
  emerald: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
  rose: 'hover:border-rose-500/50 hover:shadow-rose-500/10',
  blue: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  accentColor = 'purple',
  hoverEffect = true,
}) => {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = hoverEffect && !shouldReduceMotion

  return (
    <motion.div
      className={`rounded-lg p-6 sm:p-8 bg-card/80 backdrop-blur-xl border border-border text-card-foreground shadow-md transition-all duration-300 relative overflow-hidden ${
        accentMap[accentColor]
      } ${className}`}
      whileHover={isAnimated ? { y: -4, scale: 1.01 } : undefined}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard
