import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Loading03Icon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = React.memo(
  ({
    title = 'Failed to load mood data',
    message = 'An unexpected error occurred while processing your request. Please check your connection and try again.',
    onRetry,
    className = '',
  }) => {
    const shouldReduceMotion = useReducedMotion()
    const isAnimated = !shouldReduceMotion

    return (
      <motion.div
        initial={isAnimated ? { opacity: 0, y: 16 } : undefined}
        animate={isAnimated ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-red-500/30 bg-red-950/20 backdrop-blur-xl space-y-4 max-w-lg mx-auto ${className}`}
      >
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-inner">
          <HugeiconsIcon icon={Alert02Icon} className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-red-100 tracking-tight font-serif">{title}</h3>
          <p className="text-xs text-red-300/80 leading-relaxed font-sans max-w-sm">{message}</p>
        </div>

        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="text-xs gap-2 border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-red-200 cursor-pointer"
          >
            <HugeiconsIcon icon={Loading03Icon} className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </Button>
        )}
      </motion.div>
    )
  },
)

ErrorState.displayName = 'ErrorState'

export default ErrorState
