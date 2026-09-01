import React from 'react'
import { useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ChatWindow } from '../components/ChatWindow'

export interface AICompanionPageProps {
  className?: string
}

export const AICompanionPage: React.FC<AICompanionPageProps> = React.memo(({ className = '' }) => {
  const { sessionId } = useParams<{ sessionId?: string }>()
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  return (
    <motion.div
      initial={isAnimated ? { opacity: 0, y: 8 } : undefined}
      animate={isAnimated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`w-full h-full flex-1 flex flex-col overflow-hidden ${className}`}
    >
      <ChatWindow sessionId={sessionId} className="w-full flex-1" />
    </motion.div>
  )
})

AICompanionPage.displayName = 'AICompanionPage'

export default AICompanionPage
