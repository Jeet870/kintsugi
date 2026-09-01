import React from 'react'
import { MotivationalQuoteCard } from '@/features/onboarding/components/MotivationalQuoteCard'

export const MotivationSection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10 text-center">
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-[#D4AF37]">
          Daily Wisdom & Inspiration
        </h2>
        <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-serif">
          Grounding Thoughts for Today
        </p>
      </div>

      <div className="w-full flex justify-center">
        <MotivationalQuoteCard />
      </div>
    </section>
  )
}

export default MotivationSection
