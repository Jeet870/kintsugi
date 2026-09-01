import React from 'react'
import { PhoneCall, ShieldAlert, Heart, LifeBuoy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const EmergencySection: React.FC = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/20 text-slate-900 dark:text-zinc-100 p-8 sm:p-12 text-left space-y-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="outline" className="border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs px-3 py-1">
              <LifeBuoy className="w-3.5 h-3.5 mr-1" /> Safety & Care Pipeline
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-serif">
              Safety First: Immediate Emergency Support
            </h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
          Kintsugi is designed with automated safety guardrails. If high emotional distress or self-harm indicators are detected during AI companion interactions, our safety pipeline immediately presents verified 24/7 crisis helplines.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-xl bg-white/90 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 space-y-2 shadow-sm">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 font-serif">24/7 National Helplines</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400">Direct one-tap connection to 988 Suicide & Crisis Lifeline and international helplines.</p>
          </div>

          <div className="p-5 rounded-xl bg-white/90 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 space-y-2 shadow-sm">
            <Heart className="w-5 h-5 text-rose-500" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 font-serif">Automated Distress Safeguards</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400">Realtime intent evaluation without storing clinical diagnosis data.</p>
          </div>

          <div className="p-5 rounded-xl bg-white/90 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 space-y-2 shadow-sm">
            <LifeBuoy className="w-5 h-5 text-rose-500" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 font-serif">De-escalation Guidance</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400">Step-by-step grounding breathing protocols to help restore calm in moments of panic.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EmergencySection
