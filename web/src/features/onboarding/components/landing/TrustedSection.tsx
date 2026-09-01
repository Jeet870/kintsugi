import React from 'react'
import { TRUSTED_PARTNERS } from '@/features/onboarding/data/landingData'

export const TrustedSection: React.FC = () => {
  return (
    <section className="py-12 border-y border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 select-none shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-sans">
          Designed in alignment with principles from research & mindfulness institutions
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 transition-all duration-300">
          {TRUSTED_PARTNERS.map((partner) => (
            <span
              key={partner}
              className="text-sm sm:text-base font-bold text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white tracking-tight font-serif transition-colors"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustedSection
