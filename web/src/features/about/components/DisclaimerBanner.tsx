import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { LifebuoyIcon, InformationCircleIcon } from '@hugeicons/core-free-icons'

import { ROUTES } from '@/app/router/routes'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export interface DisclaimerBannerProps {
  compact?: boolean
  className?: string
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = React.memo(
  ({ compact = false, className = '' }) => {
    const navigate = useNavigate()

    const handleNavigateEmergency = () => {
      navigate(ROUTES.EMERGENCY.HELP)
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`w-full ${className}`}
      >
        <Card
          className={`overflow-hidden rounded-2xl border-amber-500/40 bg-card text-card-foreground backdrop-blur-2xl shadow-xl text-left select-none relative hover:border-amber-500/60 transition-colors ${
            compact ? 'p-4 sm:p-5' : 'p-6 sm:p-8'
          }`}
        >
          {/* Ambient Warm Gold Glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-20 bg-amber-500/10 blur-3xl pointer-events-none" />

          <div
            className={`flex flex-col ${
              compact ? 'gap-3.5' : 'lg:flex-row lg:items-center justify-between gap-5'
            } relative z-10 min-w-0`}
          >
            {/* Disclaimer Content */}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300 font-bold text-xs">
                <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                <span className="truncate">Important Safety & Clinical Disclaimer</span>
              </div>

              <h4
                className={`${
                  compact ? 'text-sm font-bold' : 'text-base sm:text-lg font-bold'
                } text-card-foreground font-serif leading-snug`}
              >
                Kintsugi is a Supportive Companion, Not a Clinical Service
              </h4>

              <p
                className={`${
                  compact ? 'text-xs' : 'text-xs sm:text-sm'
                } text-muted-foreground leading-relaxed font-sans`}
              >
                Kintsugi is designed for emotional self-reflection and personal wellness tracking. It is <strong>not</strong> a substitute for professional mental healthcare, clinical diagnosis, or therapy. Kintsugi is <strong>not</strong> an emergency crisis intervention service. If you are in immediate distress or facing a medical emergency, please reach out to a licensed professional or contact emergency services immediately.
              </p>
            </div>

            {/* Direct Navigation Button to Emergency Help */}
            <div className={compact ? 'w-full pt-1' : 'shrink-0 pt-2 lg:pt-0'}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                <Button
                  onClick={handleNavigateEmergency}
                  aria-label="Navigate to Emergency Help resources"
                  className={`w-full ${
                    compact
                      ? 'h-10 px-3 text-xs min-h-[40px]'
                      : 'sm:w-auto h-12 px-6 text-xs sm:text-sm min-h-[48px]'
                  } bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md border border-amber-300/40 gap-2 cursor-pointer flex items-center justify-center`}
                >
                  <HugeiconsIcon icon={LifebuoyIcon} className="w-4 h-4 text-slate-950 shrink-0" />
                  <span className="truncate">Access Emergency Help Now</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  },
)

DisclaimerBanner.displayName = 'DisclaimerBanner'

export default DisclaimerBanner
