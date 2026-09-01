import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { TESTIMONIALS, type TestimonialItem } from '@/features/onboarding/data/landingData'
import { Quote } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const TestimonialsSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-[#D4AF37]">
          Community Experiences
        </h2>
        <p className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-serif">
          Voices of Transformation
        </p>
        <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400">
          Discover how daily reflection and empathetic guidance have shaped real growth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((item: TestimonialItem, idx: number) => (
          <motion.div
            key={item.author}
            className="rounded-2xl p-6 sm:p-8 bg-white/90 dark:bg-zinc-900/80 text-slate-900 dark:text-zinc-100 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 text-left space-y-6 flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300 relative group shadow-lg"
            initial={isAnimated ? { opacity: 0, y: 20 } : undefined}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Quote className="w-8 h-8 text-amber-500 opacity-80" />
                <Badge variant="secondary" className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px]">
                  {item.tag}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-zinc-300 italic leading-relaxed">
                "{item.quote}"
              </p>
            </div>

            <div className="border-t border-slate-200 dark:border-zinc-800 pt-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 font-serif">{item.author}</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{item.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default TestimonialsSection
