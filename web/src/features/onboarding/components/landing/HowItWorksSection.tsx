import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { HOW_IT_WORKS, type StepItem } from '@/features/onboarding/data/landingData'
import { KintsugiCrackDivider } from '@/components/animated/KintsugiCrackDivider'

export const HowItWorksSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-[#D4AF37]">
          Simple Daily Practice
        </h2>
        <p className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-serif">
          How Kintsugi Works
        </p>
        <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400">
          Four effortless steps to transform daily reflection into lifelong emotional resilience.
        </p>
      </div>

      {/* Steps Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {HOW_IT_WORKS.map((step: StepItem, idx: number) => (
          <motion.div
            key={step.step}
            className="rounded-2xl p-6 sm:p-8 bg-white/90 dark:bg-zinc-900/80 text-slate-900 dark:text-zinc-100 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 space-y-4 relative group hover:border-amber-500/40 transition-all duration-300 shadow-lg"
            initial={isAnimated ? { opacity: 0, y: 24 } : undefined}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <div className="text-4xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-500 dark:from-[#D4AF37] dark:to-amber-200">
              {step.step}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight font-serif">
              {step.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Decorative Gold Seam Divider */}
      <div className="pt-8 max-w-3xl mx-auto">
        <KintsugiCrackDivider showGlow={true} />
      </div>
    </section>
  )
}

export default HowItWorksSection
