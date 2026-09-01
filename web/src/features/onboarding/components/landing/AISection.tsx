import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MessageSquare, ShieldCheck, Sparkles, HeartHandshake } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const AISection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  return (
    <section id="ai-companion" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Copy & Highlights */}
        <div className="space-y-6 text-left">
          <Badge variant="outline" className="border-violet-500/30 text-violet-700 dark:text-violet-400 px-3 py-1 text-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500 dark:text-[#D4AF37]" /> Active Reflection Engine
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight font-serif">
            An Empathetic AI Companion That Truly Listens
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
            Unlike generic chatbots, Kintsugi's companion is fine-tuned specifically for emotional reflection, active listening, and gentle self-awareness support.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-zinc-100 font-serif">Reflective & Non-Judgmental</h4>
                <p className="text-sm text-slate-600 dark:text-zinc-400">Conversations focused on helping you process thoughts without prescribing unsolicited advice.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-zinc-100 font-serif">100% Confidential</h4>
                <p className="text-sm text-slate-600 dark:text-zinc-400">Encrypted transmission ensures your inner feelings remain your personal property.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Floating Interactive Chat Display */}
        <motion.div
          className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 backdrop-blur-2xl p-6 shadow-2xl space-y-4 text-left"
          initial={isAnimated ? { opacity: 0, x: 20 } : undefined}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-700 dark:text-violet-300">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Kintsugi Companion</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Online • CBT Informed</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px]">Active Session</Badge>
          </div>

          {/* Chat Messages Preview */}
          <div className="space-y-3 pt-2 text-xs">
            <div className="bg-slate-100 dark:bg-zinc-800/80 p-3.5 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-zinc-700 max-w-[85%] text-slate-800 dark:text-zinc-200">
              Hello. How is your mind feeling today? I am here to listen whenever you're ready to share.
            </div>
            <div className="bg-violet-600/20 p-3.5 rounded-2xl rounded-tr-sm border border-violet-500/30 max-w-[85%] ml-auto text-slate-900 dark:text-violet-100 font-medium">
              I felt overwhelmed by work today, but taking a quiet walk helped me regain perspective.
            </div>
            <div className="bg-slate-100 dark:bg-zinc-800/80 p-3.5 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-zinc-700 max-w-[85%] text-slate-800 dark:text-zinc-200 space-y-1">
              <p>Recognizing when you need space is a powerful step. Give yourself credit for honoring that need today. 🌿</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AISection
