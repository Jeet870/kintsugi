import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  MessageSquare,
  Heart,
  BookOpen,
  Award,
  Wind,
  PhoneCall,
  Sparkles,
  Bell,
  TrendingUp,
  ShieldCheck,
  Zap,
  WifiOff,
} from 'lucide-react'
import { FEATURES, type FeatureItem } from '@/features/onboarding/data/landingData'

const iconMap: Record<string, React.ElementType> = {
  MessageSquare,
  Heart,
  BookOpen,
  Award,
  Wind,
  PhoneCall,
  Sparkles,
  Bell,
  TrendingUp,
  ShieldCheck,
  Zap,
  WifiOff,
}

export const FeaturesSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
          Complete Wellness Ecosystem
        </h2>
        <p className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-serif">
          Everything You Need for Mindful Self-Care
        </p>
        <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400">
          Built with care, precision, and privacy to support every dimension of your emotional journey.
        </p>
      </div>

      {/* 3x4 Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature: FeatureItem, idx: number) => {
          const IconComponent = iconMap[feature.iconName] || Sparkles

          return (
            <motion.div
              key={feature.id}
              className="group rounded-2xl p-6 sm:p-8 bg-white/90 dark:bg-zinc-900/80 text-slate-900 dark:text-zinc-100 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 shadow-lg shadow-violet-500/5 hover:border-amber-500/40 hover:shadow-violet-600/10 transition-all duration-300 relative overflow-hidden"
              initial={isAnimated ? { opacity: 0, y: 20 } : undefined}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={isAnimated ? { y: -6, scale: 1.02 } : undefined}
            >
              {/* Top Accent Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl group-hover:bg-violet-600/20 transition-all" />

              {/* Icon Container */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-700/20 border border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:text-amber-500 group-hover:border-amber-500/40 transition-colors mb-6 shadow-inner">
                <IconComponent className="w-7 h-7" />
              </div>

              {/* Feature Content */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2 tracking-tight font-serif group-hover:text-amber-500 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

export default FeaturesSection
