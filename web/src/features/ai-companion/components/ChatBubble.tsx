import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  UserIcon,
  Alert02Icon,
  ArrowRight01Icon,
  SparklesIcon,
  Clock01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons'

import { formatTime } from '@/lib/utils/formatDate'
import type { ChatMessage } from '@/types/api'
import { AppLogo } from '@/components/AppLogo'
import { TypewriterText } from './TypewriterText'
import { Marker, MarkerIcon, MarkerContent } from '@/components/ui/marker'

export interface ChatBubbleProps {
  message: ChatMessage
  isLatest?: boolean
  className?: string
}

export const ChatBubble: React.FC<ChatBubbleProps> = React.memo(
  ({ message, isLatest = false, className = '' }) => {
    const isUser = message.sender === 'user'
    const isSystem = message.sender === 'system'
    const isEscalation =
      message.sender === 'system' && message.content.toLowerCase().includes('escalation')

    const timeStr = formatTime(message.created_at)

    /* Track whether message typing has completed once (typing for first time, next time no need) */
    const [hasTyped, setHasTyped] = useState<boolean>(!isLatest)

    /* Parse <think> reasoning block from message content */
    const { reasoningText, cleanContent } = useMemo(() => {
      if (isUser || isSystem) return { reasoningText: null, cleanContent: message.content }
      const match = message.content.match(/<think>([\s\S]*?)<\/think>/i)
      if (match) {
        const reasoningText = match[1].trim()
        const cleanContent = message.content.replace(/<think>[\s\S]*?<\/think>/i, '').trim()
        return { reasoningText, cleanContent }
      }
      return { reasoningText: null, cleanContent: message.content }
    }, [message.content, isUser, isSystem])

    /* Parse reasoning steps into clean bullet markers */
    const reasoningSteps = useMemo(() => {
      if (!reasoningText) return []
      return reasoningText
        .split('\n')
        .map((s) => s.replace(/^[•\-\*]\s*/, '').trim())
        .filter(Boolean)
    }, [reasoningText])

    /* Accordion open state: OPEN during first-time live streaming, CLOSED for history/subsequent renders */
    const [isReasoningOpen, setIsReasoningOpen] = useState<boolean>(
      isLatest && !hasTyped && Boolean(reasoningText),
    )

    /* Sequential typing state: Reasoning types out first, then response body follows */
    const [isReasoningTyped, setIsReasoningTyped] = useState<boolean>(
      !isLatest || hasTyped || !reasoningText,
    )

    useEffect(() => {
      if (isLatest && !hasTyped && reasoningText) {
        setIsReasoningOpen(true)
        setIsReasoningTyped(false)
      }
    }, [isLatest, hasTyped, reasoningText])

    /* ── 1. System / Escalation Event Message ── */
    if (isEscalation) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`my-4 p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/20 backdrop-blur-md text-left space-y-2 max-w-2xl mx-auto shadow-sm ${className}`}
        >
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs">
            <HugeiconsIcon icon={Alert02Icon} className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Safety Escalation Notice</span>
            <span className="ml-auto text-[10px] text-amber-700/70 dark:text-amber-300/70 font-mono">{timeStr}</span>
          </div>
          <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-sans whitespace-pre-wrap break-words">
            {message.content.replace('[CRISIS ESCALATION]', '').trim()}
          </p>
        </motion.div>
      )
    }

    if (isSystem) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`my-3 py-1.5 px-4 rounded-full border border-border bg-muted/80 backdrop-blur-sm text-center mx-auto max-w-md ${className}`}
        >
          <p className="text-[11px] text-muted-foreground font-medium">{message.content}</p>
        </motion.div>
      )
    }

    /* ── 2. User & AI Conversational Message Bubbles (Theme Responsive) ── */
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className={`flex items-start gap-3.5 my-4.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} ${className}`}
      >
        {/* Sender Avatar: AppLogo for AI, Sleek User Pill Badge for User */}
        {isUser ? (
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300 shadow-sm">
            <HugeiconsIcon icon={UserIcon} className="w-4 h-4" />
          </div>
        ) : (
          <div className="shrink-0 flex items-center justify-center pt-0.5">
            <AppLogo size={32} animated={true} />
          </div>
        )}

        {/* Bubble Content Area */}
        <div className={`max-w-[85%] sm:max-w-[80%] space-y-1.5 ${isUser ? 'text-right' : 'text-left'}`}>
          {/* Header Metadata */}
          <div className={`flex items-center gap-2 text-[11px] font-medium text-muted-foreground px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="font-semibold text-foreground">{isUser ? 'You' : 'Kintsugi AI'}</span>
            <span className="text-[10px] text-muted-foreground/80 font-mono">{timeStr}</span>
          </div>

          {/* ChatGPT / Claude AI Style Bubble Surface */}
          <div
            className={`p-4 sm:px-5 sm:py-4 rounded-2xl shadow-sm border backdrop-blur-xl transition-colors ${
              isUser
                ? 'bg-amber-500/15 dark:bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100 rounded-tr-xs'
                : 'bg-card border-border text-card-foreground rounded-tl-xs hover:border-amber-500/20'
            }`}
          >
            {/* Model Thought Process (shadcn Marker & Antigravity Style Timeline) */}
            {!isUser && reasoningText && (
              <div className="mb-3">
                {/* Collapsible Header Single Line */}
                <button
                  type="button"
                  onClick={() => setIsReasoningOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium py-1 transition-colors select-none group"
                >
                  <span className="font-sans text-foreground font-semibold">Thought Process</span>
                  {reasoningSteps.length > 0 && (
                    <span className="text-[10px] text-muted-foreground font-mono">({reasoningSteps.length} steps)</span>
                  )}
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className={`w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform duration-200 ${
                      isReasoningOpen ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {/* Expanded Vertical Timeline Markers List */}
                <AnimatePresence>
                  {isReasoningOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mt-1 pl-0.5"
                    >
                      <div className="relative border-l border-border ml-1.5 sm:ml-2 pl-3 py-1 space-y-3">
                        {reasoningSteps.length > 0 ? (
                          reasoningSteps.map((step, idx) => (
                            <Marker key={idx} className="items-start gap-2.5 text-muted-foreground font-sans text-xs">
                              <MarkerIcon className="mt-0.5 shrink-0">
                                <HugeiconsIcon
                                  icon={
                                    idx === 0
                                      ? Clock01Icon
                                      : idx === reasoningSteps.length - 1
                                      ? CheckmarkCircle02Icon
                                      : SparklesIcon
                                  }
                                  className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0"
                                />
                              </MarkerIcon>
                              <MarkerContent className="text-foreground/90 font-sans text-xs/relaxed leading-relaxed break-words">
                                {isLatest && !hasTyped ? (
                                  <TypewriterText
                                    text={step}
                                    speed={8}
                                    isNew={true}
                                    onComplete={() => {
                                      if (idx === reasoningSteps.length - 1) {
                                        setIsReasoningTyped(true)
                                      }
                                    }}
                                  />
                                ) : (
                                  step
                                )}
                              </MarkerContent>
                            </Marker>
                          ))
                        ) : (
                          <Marker className="items-start gap-2.5 text-muted-foreground font-sans text-xs">
                            <MarkerIcon className="mt-0.5 shrink-0">
                              <HugeiconsIcon icon={SparklesIcon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                            </MarkerIcon>
                            <MarkerContent className="text-foreground/90 font-mono text-xs leading-relaxed break-words">
                              {isLatest && !hasTyped ? (
                                <TypewriterText
                                  text={reasoningText}
                                  speed={8}
                                  isNew={true}
                                  onComplete={() => setIsReasoningTyped(true)}
                                />
                              ) : (
                                reasoningText
                              )}
                            </MarkerContent>
                          </Marker>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Clean Response Body with Typewriter Effect */}
            <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words font-sans tracking-normal ${
              isUser ? 'text-amber-950 dark:text-amber-100 font-semibold' : 'text-card-foreground'
            }`}>
              {isUser ? (
                message.content
              ) : isLatest && !hasTyped ? (
                isReasoningTyped ? (
                  <TypewriterText
                    text={cleanContent}
                    speed={12}
                    isNew={true}
                    onComplete={() => setHasTyped(true)}
                  />
                ) : null
              ) : (
                cleanContent
              )}
            </p>
          </div>
        </div>
      </motion.div>
    )
  },
)

ChatBubble.displayName = 'ChatBubble'

export default ChatBubble
