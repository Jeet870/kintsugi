import React from 'react'
import { FAQS, type FAQItem } from '@/features/onboarding/data/landingData'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export const FAQSection: React.FC = () => {
  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12 text-left">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
          Got Questions?
        </h2>
        <p className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-serif">
          Frequently Asked Questions
        </p>
        <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400">
          Everything you need to know about Kintsugi, privacy, AI capabilities, and security.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4 border-none shadow-none">
        {FAQS.map((faq: FAQItem, idx: number) => (
          <AccordionItem
            key={idx}
            value={`faq-${idx}`}
            className="rounded-2xl bg-white/90 dark:bg-zinc-900/80 text-slate-900 dark:text-zinc-100 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 px-6 py-2 transition-all hover:border-amber-500/40 shadow-sm"
          >
            <AccordionTrigger className="text-base font-semibold text-slate-900 dark:text-zinc-100 hover:text-amber-500 text-left font-serif">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed pt-2">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

export default FAQSection
