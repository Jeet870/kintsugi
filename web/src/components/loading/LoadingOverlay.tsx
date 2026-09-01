import React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useLoadingStore } from '@/stores/useLoadingStore'
import { PageLoader } from '@/components/loading/PageLoader'

export const LoadingOverlay: React.FC = () => {
  const isLoading = useLoadingStore((state) => state.isLoading)
  const message = useLoadingStore((state) => state.message)
  const progress = useLoadingStore((state) => state.progress)
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="global-loading-overlay"
          className="fixed inset-0 z-[100]"
          initial={!shouldReduceMotion ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={!shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          <PageLoader
            message={message}
            progress={progress > 0 && progress < 100 ? progress : undefined}
            fullScreen={true}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoadingOverlay
