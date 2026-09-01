import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles, ArrowRight, ShieldCheck, Heart, MessageSquare, TrendingUp } from 'lucide-react'
import { ROUTES } from '@/app/router/routes'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const HeroSection: React.FC = () => {
  const navigate = useNavigate()
  const authenticated = useAuthStore((state) => state.authenticated)
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  const handleCTA = () => {
    if (authenticated) {
      navigate(ROUTES.APP.DASHBOARD)
    } else {
      navigate(ROUTES.AUTH.REGISTER)
    }
  }

  return (
    <section className="relative pt-8 pb-20 lg:pt-16 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-10">
      {/* Top Badge */}
      <motion.div
        initial={isAnimated ? { opacity: 0, y: 16 } : undefined}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-block"
      >
        <Badge
          variant="secondary"
          className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 px-3.5 py-1 rounded-full text-xs font-semibold gap-2 shadow-lg shadow-violet-500/5 backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span>Empathetic AI & Reflective Mental Wellness</span>
        </Badge>
      </motion.div>

      {/* Main Headline */}
      <motion.div
        className="space-y-5 max-w-4xl mx-auto"
        initial={isAnimated ? { opacity: 0, y: 24 } : undefined}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] font-serif">
          AI Companion for Mental Wellness,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-amber-600 dark:from-violet-400 dark:via-purple-300 dark:to-[#F5D06F]">
            Reflection & Growth
          </span>
        </h1>
        <p className="text-sm sm:text-lg text-slate-600 dark:text-zinc-400 font-normal max-w-2xl mx-auto leading-relaxed">
          Your private space for daily check-ins, guided reflection, and emotional restoration. Inspired by the Japanese art of Kintsugi—turning life's challenges into strength.
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="grid grid-cols-2 gap-3 max-w-sm mx-auto sm:flex sm:items-center sm:justify-center sm:max-w-none pt-1"
        initial={isAnimated ? { opacity: 0, y: 16 } : undefined}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Button
          onClick={handleCTA}
          className="w-full sm:w-auto h-11 px-5 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-lg shadow-violet-600/25 border border-violet-400/20 gap-2 truncate cursor-pointer"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-4 h-4 text-violet-200 shrink-0 hidden sm:inline-block" />
        </Button>
        <a href="#features" className="w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full sm:w-auto h-11 px-5 border-slate-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg font-semibold text-xs sm:text-sm backdrop-blur-md truncate cursor-pointer shadow-sm"
          >
            View Features
          </Button>
        </a>
      </motion.div>

      {/* Interactive React Dashboard Mockup Preview */}
      <motion.div
        className="pt-6 max-w-5xl mx-auto"
        initial={isAnimated ? { opacity: 0, y: 40, scale: 0.96 } : undefined}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
      >
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl text-left space-y-6 relative overflow-hidden group">
          {/* Mock Window Controls Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono ml-2">kintsugi-wellness.app/dashboard</span>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs px-2.5 py-0.5">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Encrypted & Private
            </Badge>
          </div>

          {/* Grid Layout inside Mockup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mock Card 1: Today's Mood */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-violet-500" /> Today's Mood</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Calm</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xl">
                  😌
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Feeling Peaceful</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Logged 2 hours ago</p>
                </div>
              </div>
            </div>

            {/* Mock Card 2: AI Companion */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-amber-500" /> AI Reflection</span>
                <span className="text-xs text-violet-600 dark:text-violet-400 font-mono">Active</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed italic bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                "Remember that taking things slow is a form of courage in itself."
              </p>
            </div>

            {/* Mock Card 3: Streak & Milestones */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-500" /> Consistency</span>
                <span className="text-xs text-amber-600 dark:text-amber-300 font-semibold">7 Day Streak 🔥</span>
              </div>
              <div className="flex items-center gap-1 pt-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <div key={idx} className="flex-1 text-center space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">{day}</span>
                    <div className={`h-6 rounded-md flex items-center justify-center text-xs ${idx < 6 ? 'bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'}`}>
                      ✓
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default HeroSection
