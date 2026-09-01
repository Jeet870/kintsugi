import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SparklesIcon,
  HeartIcon,
  Message01Icon,
  Compass01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons'

import { SUGGESTED_PROMPTS } from '../constants/suggestedPrompts'
import { Button } from '@/components/ui/button'

import { AppLogo } from '@/components/AppLogo'

export interface SuggestedPromptsProps {
  onSelectPrompt: (promptText: string) => void
  chatHistoryLength?: number
  className?: string
}

const CATEGORY_ICON_MAP: Record<string, unknown> = {
  Decompression: HeartIcon,
  Grounding: Compass01Icon,
  'Self-Reflection': SparklesIcon,
  'Active Listening': Message01Icon,
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = React.memo(
  ({ onSelectPrompt, chatHistoryLength = 0, className = '' }) => {
    /* Render only when no chat history exists */
    if (chatHistoryLength > 0) return null

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`my-auto py-6 text-center space-y-6 max-w-2xl mx-auto px-2 ${className}`}
        >
          {/* Header Icon & Title */}
          <div className="space-y-3 flex flex-col items-center">
            <AppLogo size={48} animated={true} />
            <h3 className="text-lg sm:text-xl font-bold text-foreground font-serif tracking-tight">
              Welcome to Kintsugi AI Companion
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed font-sans">
              An empathetic, CBT-informed safe space for active listening and self-awareness. Pick a conversation starter below or type anything to begin.
            </p>
          </div>

          {/* Selectable Prompt Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
            {SUGGESTED_PROMPTS.map((item, idx) => {
              const iconObj = (CATEGORY_ICON_MAP[item.category] || SparklesIcon) as any

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.06 }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => onSelectPrompt(item.prompt)}
                    className="w-full h-auto p-4 rounded-xl border border-border bg-card hover:bg-muted/80 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 transition-all flex flex-col items-start gap-2 group whitespace-normal cursor-pointer select-none relative overflow-hidden"
                  >
                    {/* Corner Accent Glow on Hover */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="flex items-center justify-between w-full relative z-10">
                      <div className="flex items-center gap-2 text-violet-500 dark:text-violet-400 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                          <HugeiconsIcon icon={iconObj} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-card-foreground group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                          {item.title}
                        </span>
                      </div>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 dark:group-hover:text-amber-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                      />
                    </div>

                    <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed font-sans font-normal relative z-10">
                      "{item.prompt}"
                    </p>
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    )
  },
)

SuggestedPrompts.displayName = 'SuggestedPrompts'

export default SuggestedPrompts
