import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface TimelineStep {
  step: string
  title: string
  subtitle: string
  description: string
  icon?: React.ElementType
}

export interface AnimatedTimelineProps {
  steps: TimelineStep[]
}

export const AnimatedTimeline: React.FC<AnimatedTimelineProps> = ({ steps }) => {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  return (
    <div className="space-y-8 relative text-left">
      {/* Vertical connection line */}
      <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-violet-600 via-purple-600 to-[#D4AF37] hidden sm:block opacity-40" />

      {steps.map((item, idx) => {
        const Icon = item.icon

        return (
          <motion.div
            key={idx}
            className="flex flex-col sm:flex-row items-start gap-6 relative"
            initial={isAnimated ? { opacity: 0, x: -20 } : undefined}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            {/* Step Icon Badge */}
            <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold font-mono text-base shrink-0 z-10 shadow-md">
              {Icon ? <Icon className="w-5 h-5" /> : item.step}
            </div>

            {/* Step Content Card */}
            <div className="flex-1 rounded-2xl p-6 bg-card text-card-foreground backdrop-blur-xl border border-border space-y-2 hover:border-amber-500/40 transition-all shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="text-lg font-bold text-card-foreground font-serif">{item.title}</h4>
                <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 font-mono">{item.subtitle}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default AnimatedTimeline
