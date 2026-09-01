import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CallIcon,
  HeartIcon,
  Clock01Icon,
  Shield02Icon,
  Globe02Icon,
  LockIcon,
} from '@hugeicons/core-free-icons'

import { useHelplines } from '@/features/emergency-help/hooks/useHelplines'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/feedback/EmptyState'

export interface TalkToSomeoneCardProps {
  countryCode?: string
  className?: string
}

export const TalkToSomeoneCard: React.FC<TalkToSomeoneCardProps> = React.memo(
  ({ countryCode = 'IN', className = '' }) => {
    const { data: helplinesData, isLoading, isError } = useHelplines({ countryCode })

    /* Top priority helpline: backend returns ordered list, take first item */
    const primaryHelpline = useMemo(() => {
      if (!helplinesData || helplinesData.length === 0) return null
      return helplinesData[0]
    }, [helplinesData])

    const phoneClean = primaryHelpline
      ? primaryHelpline.phone_number.replace(/[^0-9+]/g, '')
      : ''

    return (
      <AnimatePresence mode="wait">
        {/* ── State 1: Skeleton Loading Placeholder ── */}
        {isLoading && (
          <motion.div
            key="loading-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`w-full ${className}`}
          >
            <Card className="p-6 rounded-2xl border border-amber-500/30 bg-card text-card-foreground space-y-4">
              <Skeleton className="w-48 h-5 bg-muted" />
              <Skeleton className="w-full h-8 bg-muted rounded-xl" />
              <Skeleton className="w-full h-14 bg-muted rounded-full" />
            </Card>
          </motion.div>
        )}

        {/* ── State 2: Empty State ── */}
        {!isLoading && (isError || !primaryHelpline) && (
          <motion.div
            key="empty-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`w-full ${className}`}
          >
            <Card className="p-6 rounded-2xl border border-amber-500/30 bg-card text-card-foreground">
              <EmptyState
                icon={<HugeiconsIcon icon={HeartIcon} className="w-8 h-8 text-amber-500 dark:text-amber-400" />}
                title="Immediate Support Available"
                description="Emergency helplines are accessible below."
                size="sm"
              />
            </Card>
          </motion.div>
        )}

        {/* ── State 3: Prominent Top-Priority Helpline Card ── */}
        {!isLoading && primaryHelpline && (
          <motion.div
            key="primary-helpline-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`w-full ${className}`}
          >
            <Card className="p-6 sm:p-7 rounded-2xl border border-amber-500/40 bg-card text-card-foreground backdrop-blur-2xl shadow-xl text-left space-y-4 relative overflow-hidden select-none hover:border-amber-500/60 transition-colors">
              {/* Background Ambient Soft Gold Glow */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />

              <CardHeader className="p-0 space-y-2.5 relative z-10">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-xs"
                  >
                    <HugeiconsIcon icon={HeartIcon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>Highest Priority Crisis Care</span>
                  </Badge>

                  <Badge
                    variant="outline"
                    className="bg-muted border border-border text-foreground text-xs font-mono px-3 py-1 rounded-full"
                  >
                    <span className="text-amber-500 dark:text-amber-400 font-bold mr-1.5">{countryCode}</span> India
                  </Badge>
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-card-foreground font-serif">
                    {primaryHelpline.organization_name} ({primaryHelpline.phone_number})
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground font-sans">
                    Professional support. Compassionate care. Confidential and free.
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-0 space-y-5 relative z-10">
                {/* Metadata Row: 24/7 Available, Confidential, Across India */}
                <div className="flex items-center gap-4 flex-wrap text-xs font-mono text-amber-600 dark:text-amber-300 font-medium">
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Clock01Icon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>{primaryHelpline.availability || '24/7 Available'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={LockIcon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>Confidential</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Globe02Icon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>Across India</span>
                  </div>
                </div>

                {/* Full Width Prominent Call CTA Button */}
                <a
                  href={`tel:${phoneClean}`}
                  aria-label={`Call emergency helpline ${primaryHelpline.organization_name} at ${primaryHelpline.phone_number}`}
                  className="flex items-center justify-center gap-3 w-full h-14 px-6 rounded-full bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-base sm:text-lg shadow-md shadow-amber-500/20 transition-all border border-amber-300/40 cursor-pointer min-h-[52px]"
                >
                  <HugeiconsIcon icon={CallIcon} className="w-5 h-5 text-slate-950" />
                  <span>Talk to Someone Now ({primaryHelpline.phone_number})</span>
                </a>

                {/* Reassurance Note */}
                <div className="flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400/90 font-sans pt-0.5">
                  <HugeiconsIcon icon={Shield02Icon} className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span>Your call is free, confidential, and connects you to trained professionals.</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    )
  },
)

TalkToSomeoneCard.displayName = 'TalkToSomeoneCard'

export default TalkToSomeoneCard
