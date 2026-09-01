import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { LifebuoyIcon, Shield02Icon } from '@hugeicons/core-free-icons'

import { ROUTES } from '@/app/router/routes'
import { Button } from '@/components/ui/button'

export interface EmergencyButtonProps {
  mode?: 'nav' | 'fab' | 'inline'
  className?: string
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = React.memo(
  ({ mode = 'inline', className = '' }) => {
    const navigate = useNavigate()

    const handleNavigateEmergency = () => {
      navigate(ROUTES.EMERGENCY.HELP)
    }

    /* ── Mode 1: Compact Navigation Item ── */
    if (mode === 'nav') {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNavigateEmergency}
          aria-label="Open Emergency Help"
          className={`h-9 px-3 border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200 rounded-xl font-semibold text-xs gap-1.5 transition-all shadow-sm ${className}`}
        >
          <HugeiconsIcon icon={LifebuoyIcon} className="w-4 h-4 text-amber-400" />
          <span>Emergency Help</span>
        </Button>
      )
    }

    /* ── Mode 2: Floating Action Button (FAB) ── */
    if (mode === 'fab') {
      return (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`fixed bottom-6 right-6 z-50 ${className}`}
        >
          <Button
            onClick={handleNavigateEmergency}
            aria-label="Open Emergency Help"
            className="h-13 px-5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-full shadow-2xl shadow-amber-500/40 border border-amber-300/40 gap-2 text-xs sm:text-sm cursor-pointer min-h-[48px] min-w-[48px]"
          >
            <HugeiconsIcon icon={Shield02Icon} className="w-5 h-5 text-zinc-950" />
            <span className="hidden sm:inline">Emergency Help</span>
          </Button>
        </motion.div>
      )
    }

    /* ── Mode 3: Standard Inline Full Width Button ── */
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={className}>
        <Button
          onClick={handleNavigateEmergency}
          aria-label="Open Emergency Help"
          className="w-full h-12 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-zinc-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 gap-2 border border-amber-300/40 text-xs sm:text-sm cursor-pointer min-h-[44px]"
        >
          <HugeiconsIcon icon={Shield02Icon} className="w-5 h-5 text-zinc-950" />
          <span>Need Emergency Support Now? Tap Here</span>
        </Button>
      </motion.div>
    )
  },
)

EmergencyButton.displayName = 'EmergencyButton'

export default EmergencyButton
