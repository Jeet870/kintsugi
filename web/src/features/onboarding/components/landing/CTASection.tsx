import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { ROUTES } from '@/app/router/routes'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'

export const CTASection: React.FC = () => {
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
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        className="rounded-2xl border border-violet-500/30 bg-white/95 dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 p-8 sm:p-16 text-center space-y-8 relative overflow-hidden shadow-2xl"
        initial={isAnimated ? { opacity: 0, scale: 0.98 } : undefined}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/15 blur-3xl pointer-events-none" />

        <div className="space-y-4 max-w-3xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-[#D4AF37]">
            <Sparkles className="w-4 h-4" /> Start Your Personal Journey Today
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight font-serif">
            Embrace Your Story with Kintsugi
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-xl mx-auto">
            Join thousands cultivating daily mindfulness, self-compassion, and emotional restoration.
          </p>
        </div>

        <div className="relative z-10 pt-4">
          <Button
            onClick={handleCTA}
            size="lg"
            className="h-16 px-10 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-lg rounded-xl shadow-2xl shadow-violet-600/40 border border-violet-400/20 gap-3 cursor-pointer"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-6 h-6 text-violet-200" />
          </Button>
        </div>
      </motion.div>
    </section>
  )
}

export default CTASection
