import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Shield02Icon,
  CallIcon,
  Alert02Icon,
  HeartIcon,
} from '@hugeicons/core-free-icons'

import { ROUTES } from '@/app/router/routes'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export interface HelplineItem {
  title: string
  phone?: string
  website?: string
  description?: string
}

export interface EscalationPayload {
  message?: string
  reason?: string
  level?: string
  helplines?: HelplineItem[]
}

export interface EscalationBannerProps {
  payload?: EscalationPayload
  reason?: string
  className?: string
}

export const EscalationBanner: React.FC<EscalationBannerProps> = React.memo(
  ({ payload, reason, className = '' }) => {
    const navigate = useNavigate()

    const bannerMessage =
      payload?.message ||
      payload?.reason ||
      reason ||
      'We detected expressions of severe distress. Kintsugi is a self-care companion and cannot substitute professional emergency healthcare. Please reach out to immediate support services:'

    const helplinesList = payload?.helplines ?? [
      {
        title: '988 Suicide & Crisis Lifeline',
        phone: '988',
        description: 'Free 24/7 confidential emergency crisis support.',
      },
      {
        title: 'Emergency Services',
        phone: '911 / 112',
        description: 'Immediate emergency medical response.',
      },
    ]

    const handleNavigateEmergency = () => {
      navigate(ROUTES.EMERGENCY.HELP)
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`my-4 ${className}`}
      >
        <Card className="overflow-hidden border-amber-500/30 dark:border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/40 backdrop-blur-xl shadow-xl shadow-amber-500/5 dark:shadow-amber-950/40 text-left border">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-amber-500/20 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs sm:text-sm">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                <HugeiconsIcon icon={Shield02Icon} className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Immediate Crisis & Safety Support
              </CardTitle>
            </div>
            <span className="text-[10px] uppercase font-mono text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 bg-amber-500/20 rounded border border-amber-500/30">
              24/7 Helpline
            </span>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-4">
            <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-sans font-medium">
              {bannerMessage}
            </p>

            {/* Helpline Contact Cards List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {helplinesList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-amber-500/25 bg-amber-500/10 dark:bg-amber-950/40 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-amber-950 dark:text-amber-100">{item.title}</h5>
                    {item.phone && (
                      <a
                        href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`}
                        className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1"
                      >
                        <HugeiconsIcon icon={CallIcon} className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                        <span>{item.phone}</span>
                      </a>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-300/70 font-medium">{item.description}</p>
                  )}
                  {item.website && (
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-amber-700 dark:text-amber-400 hover:underline inline-block pt-0.5 font-bold"
                    >
                      Visit Official Resource →
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Primary Action Button to React Router Emergency Help Page */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <Button
                onClick={handleNavigateEmergency}
                className="w-full sm:w-auto h-10 px-5 bg-amber-500 hover:bg-amber-600 dark:hover:bg-amber-400 text-zinc-950 font-bold rounded-lg shadow-lg shadow-amber-500/20 gap-2 border border-amber-300/40 text-xs cursor-pointer"
              >
                <HugeiconsIcon icon={HeartIcon} className="w-4 h-4 text-zinc-950" />
                <span>Talk to Someone Now</span>
              </Button>

              <span className="text-[10px] text-amber-800 dark:text-amber-400/80 font-mono font-medium flex items-center gap-1">
                <HugeiconsIcon icon={Alert02Icon} className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                <span>Encrypted & Confidential Guidance</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  },
)

EscalationBanner.displayName = 'EscalationBanner'

export default EscalationBanner
