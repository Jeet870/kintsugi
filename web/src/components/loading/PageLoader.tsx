import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { LogoLoader } from '@/components/loading/LogoLoader'
import { LoadingProgress } from '@/components/loading/LoadingProgress'
import { HexagonBackground } from '@/components/background/HexagonBackground'

export interface PageLoaderProps {
  message?: string
  progress?: number
  fullScreen?: boolean
  className?: string
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Preparing your wellness experience...',
  progress,
  fullScreen = true,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`${
        fullScreen ? 'fixed inset-0 z-[100]' : 'relative w-full min-h-[400px]'
      } flex flex-col items-center justify-center p-6 bg-background text-foreground overflow-hidden select-none ${className}`}
    >
      {/* ── Background Effects ── */}
      {fullScreen && <HexagonBackground density="low" animated={isAnimated} />}

      {/* ── Centered Loader Card ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm mx-auto"
        initial={isAnimated ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Animated Kintsugi SVG Logo */}
        <LogoLoader size={110} animated={isAnimated} />

        {/* Brand Heading & Animated Message Subtitle */}
        <div className="space-y-2 pt-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground font-serif">
            Kintsugi AI
          </h2>
          <motion.p
            key={message}
            className="text-xs text-muted-foreground font-medium tracking-wide leading-relaxed max-w-xs"
            initial={isAnimated ? { opacity: 0, y: 6 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {message}
          </motion.p>
        </div>

        {/* Progress Line */}
        <LoadingProgress
          progress={progress}
          indeterminate={progress === undefined}
        />
      </motion.div>
    </div>
  )
}

export default PageLoader
