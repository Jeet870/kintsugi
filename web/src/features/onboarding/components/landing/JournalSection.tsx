import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { BookOpen, Lock, FileText, CheckCircle2, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const JournalSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Encrypted Journal Preview Card */}
        <motion.div
          className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 backdrop-blur-2xl p-6 sm:p-8 space-y-4 text-left order-2 lg:order-1 shadow-2xl"
          initial={isAnimated ? { opacity: 0, x: -20 } : undefined}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 font-serif">Reflective Entry #42</span>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px]">
              <Lock className="w-3 h-3 mr-1" /> AES-256 Encrypted
            </Badge>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-zinc-400 font-mono leading-relaxed pt-2 bg-slate-50 dark:bg-zinc-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800/80">
            <p className="font-sans text-sm font-semibold text-slate-900 dark:text-zinc-100 font-serif">"Finding Balance in Everyday Moments"</p>
            <p className="font-sans text-slate-600 dark:text-zinc-400 leading-relaxed text-xs">
              Today reminded me that growth is not linear. Small setbacks do not erase the progress made over the past month. I am learning to appreciate the stillness...
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-500 dark:text-zinc-400">
            <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Markdown Format</span>
            <span>•</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Saved Locally & Cloud Synced</span>
          </div>
        </motion.div>

        {/* Right: Content & Value Props */}
        <div className="space-y-6 text-left order-1 lg:order-2">
          <Badge variant="outline" className="border-violet-500/30 text-violet-700 dark:text-violet-400 px-3 py-1 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Sanctuary for Your Thoughts
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight font-serif">
            Encrypted Private Journal
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
            Write freely without fear of intrusion. Your reflective journal is protected by military-grade encryption and synchronized across all your devices.
          </p>

          <ul className="space-y-3 text-sm text-slate-600 dark:text-zinc-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400" /> Full Markdown formatting with rich text support
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400" /> Automatic date stamping and emotional tag linking
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400" /> Offline draft saving with instant cloud synchronization
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default JournalSection
