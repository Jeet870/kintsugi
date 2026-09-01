import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/breadcrumb'
import { Sparkles } from 'lucide-react'

export interface PageHeroProps {
  title: string
  highlightedTitle?: string
  subtitle: string
  badgeText?: string
  breadcrumbItems: BreadcrumbItem[]
  icon?: React.ElementType
  className?: string
}

export const PageHero: React.FC<PageHeroProps> = ({
  title,
  highlightedTitle,
  subtitle,
  badgeText,
  breadcrumbItems,
  icon: Icon = Sparkles,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  return (
    <section className={`pt-8 pb-12 lg:pt-14 lg:pb-16 text-center space-y-6 max-w-4xl mx-auto px-4 ${className}`}>
      {/* Breadcrumbs */}
      <div className="flex justify-center mb-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Category Badge */}
      {badgeText && (
        <motion.div
          initial={isAnimated ? { opacity: 0, y: 12 } : undefined}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-block"
        >
          <Badge
            variant="secondary"
            className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 px-3.5 py-1 rounded-full text-xs font-semibold gap-2 backdrop-blur-md"
          >
            <Icon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>{badgeText}</span>
          </Badge>
        </motion.div>
      )}

      {/* Hero Headline */}
      <motion.h1
        className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight font-serif"
        initial={isAnimated ? { opacity: 0, y: 20 } : undefined}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {title}{' '}
        {highlightedTitle && (
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-500 to-amber-500 dark:from-violet-400 dark:via-purple-300 dark:to-[#F5D06F]">
            {highlightedTitle}
          </span>
        )}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-base sm:text-xl text-muted-foreground font-normal max-w-2xl mx-auto leading-relaxed"
        initial={isAnimated ? { opacity: 0, y: 16 } : undefined}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {subtitle}
      </motion.p>
    </section>
  )
}

export default PageHero
