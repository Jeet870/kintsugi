import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppLogo } from '@/components/AppLogo'

export interface TypingIndicatorProps {
  isTyping: boolean
  className?: string
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = React.memo(
  ({ isTyping, className = '' }) => {
    if (!isTyping) return null

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`flex items-center gap-3 my-3 text-left ${className}`}
        >
          {/* Animated AppLogo for AI typing state */}
          <div className="shrink-0 flex items-center justify-center pt-0.5">
            <AppLogo size={32} animated={true} />
          </div>

          {/* Typing Bubble Container with ChatGPT/Claude AI Styling */}
          <div className="py-3 px-4.5 rounded-2xl rounded-tl-xs bg-[#18181b]/80 border border-white/[0.08] shadow-xl backdrop-blur-xl flex items-center gap-3">
            <span className="text-xs text-zinc-300 font-medium font-sans tracking-tight">Kintsugi AI is reflecting</span>
            <div className="flex items-center gap-1.5">
              <motion.span
                animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                className="w-1.5 h-1.5 rounded-full bg-amber-400"
              />
              <motion.span
                animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-amber-400"
              />
              <motion.span
                animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                className="w-1.5 h-1.5 rounded-full bg-amber-400"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  },
)

TypingIndicator.displayName = 'TypingIndicator'

export default TypingIndicator
