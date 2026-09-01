import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { TECHNOLOGY, type TechItem } from '@/features/onboarding/data/landingData'
import { Badge } from '@/components/ui/badge'
import { Cpu } from 'lucide-react'

export const TechnologySection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  return (
    <section id="technology" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="outline" className="border-violet-500/30 text-violet-700 dark:text-violet-400 px-3 py-1 text-xs">
          <Cpu className="w-3.5 h-3.5 mr-1" /> Built For High Performance & Security
        </Badge>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-serif">
          Modern Enterprise Tech Stack
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400">
          Engineered with resilient open-source frameworks and cutting-edge web standards.
        </p>
      </div>

      {/* Grid of 10 Tech Stack Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {TECHNOLOGY.map((item: TechItem, idx: number) => (
          <motion.div
            key={item.name}
            className="rounded-2xl p-5 bg-white/90 dark:bg-zinc-900/80 text-slate-900 dark:text-zinc-100 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 space-y-3 text-left hover:border-amber-500/40 transition-all duration-300 group shadow-md"
            initial={isAnimated ? { opacity: 0, y: 16 } : undefined}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: idx * 0.04 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">{item.category}</span>
              <Badge variant="secondary" className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] px-2 py-0.5">{item.badge}</Badge>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors font-serif">
              {item.name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default TechnologySection
