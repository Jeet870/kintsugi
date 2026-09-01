import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { SECURITY_POINTS, type SecurityPoint } from '@/features/onboarding/data/landingData'
import { ShieldCheck } from 'lucide-react'

export const SecuritySection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Uncompromised Security
        </h2>
        <p className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-serif">
          Your Privacy Is Non-Negotiable
        </p>
        <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400">
          We protect your personal reflection data using industry-leading security practices and strict access controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SECURITY_POINTS.map((point: SecurityPoint, idx: number) => (
          <motion.div
            key={point.title}
            className="rounded-2xl p-6 sm:p-8 bg-white/90 dark:bg-zinc-900/80 text-slate-900 dark:text-zinc-100 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 text-left space-y-3 hover:border-emerald-500/40 transition-all shadow-lg"
            initial={isAnimated ? { opacity: 0, y: 16 } : undefined}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 font-serif">{point.title}</h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">{point.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default SecuritySection
