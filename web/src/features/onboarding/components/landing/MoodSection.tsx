import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Heart, TrendingUp } from 'lucide-react'

export const MoodSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  const moodSpectrum = [
    { emoji: '😄', label: 'Happy', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
    { emoji: '😌', label: 'Calm', color: 'border-violet-500/40 text-violet-400 bg-violet-500/10' },
    { emoji: '🌧️', label: 'Sad', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
    { emoji: '😤', label: 'Angry', color: 'border-red-500/40 text-red-400 bg-red-500/10' },
    { emoji: '😰', label: 'Anxious', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
    { emoji: '😴', label: 'Tired', color: 'border-zinc-500/40 text-zinc-400 bg-zinc-500/10' },
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
          Emotional Awareness
        </h2>
        <p className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-serif">
          Track Your Mood Spectrum
        </p>
        <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400">
          Effortlessly log daily check-ins and discover meaningful patterns in your emotional well-being.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left: Interactive Emoji Selector Showcase */}
        <motion.div
          className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 backdrop-blur-2xl p-6 sm:p-8 space-y-6 text-left shadow-xl"
          initial={isAnimated ? { opacity: 0, scale: 0.98 } : undefined}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2 font-serif">
            <Heart className="w-5 h-5 text-violet-600 dark:text-violet-400" /> How are you feeling right now?
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {moodSpectrum.map((item) => (
              <div
                key={item.label}
                className={`p-3 rounded-xl border ${item.color} text-center space-y-1 hover:scale-105 transition-all cursor-pointer`}
              >
                <div className="text-2xl">{item.emoji}</div>
                <div className="text-[11px] font-medium">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/80 text-xs text-slate-600 dark:text-zinc-400 space-y-2">
            <span className="font-semibold text-slate-900 dark:text-zinc-100">Daily Reflection Note</span>
            <p className="italic text-slate-600 dark:text-zinc-400">"Felt productive after finishing the morning exercise. Grateful for peace."</p>
          </div>
        </motion.div>

        {/* Right: Analytical Trajectory Mock Card */}
        <motion.div
          className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 backdrop-blur-2xl p-6 sm:p-8 space-y-6 text-left shadow-xl"
          initial={isAnimated ? { opacity: 0, scale: 0.98 } : undefined}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2 font-serif">
                <TrendingUp className="w-5 h-5 text-emerald-500" /> Weekly Trajectory
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">7-Day Emotional Consistency</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-amber-600 dark:text-[#D4AF37]">85%</span>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Positive Balance</p>
            </div>
          </div>

          {/* Bar Chart Visual Mockup */}
          <div className="h-32 flex items-end justify-between gap-2 pt-4">
            {[60, 80, 45, 90, 75, 85, 95].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  className="w-full bg-gradient-to-t from-violet-600/40 to-violet-400 rounded-t-lg transition-all"
                  style={{ height: `${val}%` }}
                />
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default MoodSection
