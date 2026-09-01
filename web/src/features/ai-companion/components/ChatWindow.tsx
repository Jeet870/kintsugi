import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SentIcon,
  Loading03Icon,
  Message01Icon,
  Shield02Icon,
  Attachment01Icon,
  Clock01Icon,
  Add01Icon,
  InformationCircleIcon,
  LifebuoyIcon,
  CheckmarkCircle02Icon,
  ArrowDown01Icon,
} from '@hugeicons/core-free-icons'

import { ROUTES } from '@/app/router/routes'
import { useChatSession } from '@/features/ai-companion/hooks/useChatSession'
import { useSendMessage } from '@/features/ai-companion/hooks/useSendMessage'
import { useChatSocket } from '@/features/ai-companion/hooks/useChatSocket'
import { useUserSessions } from '@/features/ai-companion/hooks/useUserSessions'
import { chatApi } from '@/features/ai-companion/api/chatApi'

import { AppLogo } from '@/components/AppLogo'
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner'
import { ChatBubble } from './ChatBubble'
import { TypingIndicator } from './TypingIndicator'
import { EscalationBanner } from './EscalationBanner'
import { SuggestedPrompts } from './SuggestedPrompts'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { formatShortDate } from '@/lib/utils/formatDate'

export interface ChatWindowProps {
  sessionId?: string
  className?: string
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ sessionId, className = '' }) => {
  const navigate = useNavigate()
  const [inputText, setInputText] = useState('')
  const [isStartingNew, setIsStartingNew] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const messagesContainerRef = useRef<HTMLDivElement>(null)

  /* 1. Active Chat Session */
  const { data: session, isLoading } = useChatSession({ sessionId })
  const activeSessionId = session ? String(session.id) : undefined

  /* 2. User Session History List for Right Sheet */
  const { data: userSessions, isLoading: isLoadingSessions, refetch: refetchSessions } = useUserSessions()

  /* 3. Real-time WebSocket event subscription & typing indicator state */
  const { isTyping, setTyping } = useChatSocket(activeSessionId)

  /* 4. Send message mutation hook */
  const { mutate: sendMessage, isPending: isSending } = useSendMessage({
    onSuccess: () => {
      setTyping(false)
      refetchSessions()
    },
    onError: () => {
      setTyping(false)
    },
  })

  const messages = useMemo(() => session?.messages ?? [], [session?.messages])
  const isEscalated = session?.status === 'escalated'

  /* Automatically clear typing indicator when AI/system message arrives */
  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    if (lastMsg && (lastMsg.sender === 'ai' || lastMsg.sender === 'system')) {
      setTyping(false)
    }
  }, [messages, setTyping])

  /* 5. Smart Auto-Scroll Behavior */
  const checkIsAtBottom = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return true
    const threshold = 120
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    return distanceFromBottom <= threshold
  }, [])

  const handleScroll = useCallback(() => {
    const atBottom = checkIsAtBottom()
    setIsAtBottom(atBottom)
  }, [checkIsAtBottom])

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      const container = messagesContainerRef.current
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto',
        })
        setIsAtBottom(true)
      }
    })
  }, [])

  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      if (isAtBottom) {
        scrollToBottom(true)
      }
    }
  }, [messages.length, isTyping, isAtBottom, scrollToBottom])

  /* 6. Handle Submit */
  const handleSend = useCallback(() => {
    const trimmed = inputText.trim()
    if (!trimmed || !activeSessionId || isSending) return

    setTyping(true)
    sendMessage({ sessionId: activeSessionId, text: trimmed })
    setInputText('')
  }, [inputText, activeSessionId, isSending, sendMessage, setTyping])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSelectSuggestedPrompt = (promptText: string) => {
    if (!activeSessionId || isSending) return
    setTyping(true)
    sendMessage({ sessionId: activeSessionId, text: promptText })
  }

  const handleStartNewSession = async () => {
    if (isStartingNew) return
    try {
      setIsStartingNew(true)
      const newSession = await chatApi.startSession()
      await refetchSessions()
      navigate(ROUTES.CHAT.SESSION(String(newSession.id)))
    } catch {
      // fallback
    } finally {
      setIsStartingNew(false)
    }
  }

  return (
    <Sheet>
      <div
        className={`flex flex-col h-full w-full overflow-hidden text-left relative bg-background text-foreground transition-colors duration-250 ${className}`}
      >
        {/* Ambient background lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/5 via-violet-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* ── Fixed Header Top Navigation (Stays fixed at top, never scrolls) ── */}
        <header className="p-3 sm:p-4 border-b border-border bg-card/90 backdrop-blur-xl shrink-0 flex items-center justify-between z-20 sticky top-0 transition-colors duration-250">
          <div className="flex items-center gap-3">
            <div className="shrink-0 flex items-center justify-center">
              <AppLogo size={32} animated={true} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-foreground font-serif">
                  {session?.title || 'Kintsugi AI Companion'}
                </h2>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-2 py-0.5 font-medium rounded-full ${
                    isEscalated
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-300'
                      : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                  }`}
                >
                  {isEscalated ? 'Escalated' : 'Active'}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground font-sans hidden sm:block">
                CBT-informed active listening & reflective support
              </p>
            </div>
          </div>

          {/* Header Controls: New Chat + Sheet History Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleStartNewSession}
              disabled={isStartingNew}
              className="h-8 px-2.5 sm:px-3 text-xs bg-muted/80 border-border hover:bg-muted text-foreground gap-1.5 rounded-lg cursor-pointer transition-colors"
            >
              {isStartingNew ? (
                <HugeiconsIcon icon={Loading03Icon} className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <HugeiconsIcon icon={Add01Icon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              )}
              <span className="hidden sm:inline">New Chat</span>
            </Button>

            {/* Sheet Trigger for History Panel */}
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="h-8 px-2.5 sm:px-3 text-xs bg-muted/80 border-border hover:bg-muted text-foreground gap-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <HugeiconsIcon icon={Clock01Icon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span className="hidden sm:inline">History & Info</span>
              </Button>
            </SheetTrigger>
          </div>
        </header>

        {/* ── Dedicated Scrollable Conversation Area (ONLY THIS CONTAINER SCROLLS) ── */}
        <div className="flex-1 overflow-hidden relative flex flex-col justify-between z-10">
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 scroll-smooth"
          >
            <div className="max-w-3xl mx-auto w-full">
              <AnimatePresence mode="wait">
                {/* Loading Initial Session with Animated AppLogo Loader */}
                {isLoading && !session && (
                  <motion.div
                    key="loading-session"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center py-24 space-y-4 text-center my-auto select-none"
                  >
                    <AppLogo size={56} animated={true} />
                    <LoadingSpinner size="md" label="Restoring active session..." />
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-zinc-300 font-sans tracking-wide">
                        Connecting to Kintsugi AI...
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        Securing 256-bit encrypted vault session
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Empty Session: Suggested Starters */}
                {!isLoading && messages.length === 0 && (
                  <SuggestedPrompts
                    key="suggested-prompts"
                    chatHistoryLength={messages.length}
                    onSelectPrompt={handleSelectSuggestedPrompt}
                  />
                )}

                {/* Populated Conversation List */}
                {!isLoading && messages.length > 0 && (
                  <div key="messages-list" className="space-y-4 pb-4">
                    {messages.map((msg, index) => (
                      <ChatBubble key={msg.id} message={msg} isLatest={index === messages.length - 1} />
                    ))}

                    {/* Real-Time Typing Indicator */}
                    <TypingIndicator
                      key="typing-indicator"
                      isTyping={isTyping && messages[messages.length - 1]?.sender === 'user'}
                    />

                    {/* Inline Escalation Banner */}
                    {isEscalated && <EscalationBanner key="escalation-banner" />}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Floating Scroll Down Arrow Button (ChatGPT / Claude AI Style) */}
          <AnimatePresence>
            {!isAtBottom && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={() => scrollToBottom(true)}
                  aria-label="Scroll to bottom"
                  className="w-9 h-9 rounded-full bg-card hover:bg-muted text-foreground border border-border shadow-xl backdrop-blur-xl flex items-center justify-center transition-all cursor-pointer group active:scale-95"
                >
                  <HugeiconsIcon icon={ArrowDown01Icon} className="w-4 h-4 group-hover:translate-y-0.5 transition-transform text-foreground" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Fixed Bottom AI Composer (Floating Input Capsule with Theme Background) ── */}
        <div className="shrink-0 sticky bottom-0 z-20 px-3 sm:px-4 pb-4 pt-2 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none transition-colors duration-250">
          <div className="max-w-3xl mx-auto w-full space-y-2 pointer-events-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="w-full"
            >
              {/* Floating Input Composer Capsule */}
              <div className="relative flex flex-col bg-card border border-border focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/20 rounded-2xl p-3 sm:p-3.5 shadow-xl transition-all duration-300">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Share what is on your mind... (Enter sends, Shift+Enter for new line)"
                  disabled={isSending || isEscalated}
                  rows={2}
                  className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none text-foreground placeholder:text-muted-foreground resize-none text-xs sm:text-sm leading-relaxed p-1 min-h-[48px] max-h-[160px] overflow-y-auto scrollbar-thin shadow-none"
                />

                {/* Bottom Toolbar inside Composer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  {/* Left Action Icons */}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled
                      title="File Attachment (Coming Soon)"
                      className="h-7 w-7 text-muted-foreground opacity-40 cursor-not-allowed"
                    >
                      <HugeiconsIcon icon={Attachment01Icon} className="w-4 h-4" />
                    </Button>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline font-mono">
                      Press Enter to send, Shift+Enter for line break
                    </span>
                  </div>

                  {/* Right Embedded Send Button */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      disabled={!inputText.trim() || isSending || isEscalated || !activeSessionId}
                      aria-label="Send message"
                      className="h-9 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 dark:text-zinc-950 font-bold shadow-md shadow-amber-500/20 flex items-center justify-center border border-amber-300/50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs gap-1.5"
                    >
                      {isSending ? (
                        <HugeiconsIcon icon={Loading03Icon} className="w-3.5 h-3.5 animate-spin text-slate-950 dark:text-zinc-950" />
                      ) : (
                        <>
                          <span>Send</span>
                          <HugeiconsIcon icon={SentIcon} className="w-3.5 h-3.5 text-slate-950 dark:text-zinc-950" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </form>

            {/* Micro Disclaimer Footnote */}
            <div className="flex items-center justify-between px-1 text-[10px] text-muted-foreground font-sans">
              <span className="flex items-center gap-1 text-muted-foreground">
                <HugeiconsIcon icon={Message01Icon} className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                <span>CBT-Informed Active Listening</span>
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <HugeiconsIcon icon={Shield02Icon} className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                <span>256-Bit Encrypted Vault</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── Right-Side History & Sessions Sheet ── */}
        <SheetContent side="right" className="w-full sm:max-w-md bg-card border-border text-card-foreground p-6 space-y-6">
          <SheetHeader className="p-0 border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                <HugeiconsIcon icon={Clock01Icon} className="w-4 h-4" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-card-foreground font-serif">
                  Chat Sessions & Info
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Previous conversations & AI companion guardrails
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="h-[calc(100vh-180px)] overflow-y-auto pr-2">
            <div className="space-y-6">
              {/* Section 1: Previous Sessions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    Previous Sessions
                  </h4>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={handleStartNewSession}
                    disabled={isStartingNew}
                    className="text-[11px] text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 gap-1 p-0 h-auto"
                  >
                    <HugeiconsIcon icon={Add01Icon} className="w-3 h-3" />
                    <span>New Session</span>
                  </Button>
                </div>

                {isLoadingSessions && (
                  <div className="space-y-2 py-2">
                    <Skeleton className="h-12 w-full bg-muted/60 rounded-xl" />
                    <Skeleton className="h-12 w-full bg-muted/40 rounded-xl" />
                  </div>
                )}

                {!isLoadingSessions && (!userSessions || userSessions.length === 0) && (
                  <div className="p-4 rounded-xl border border-border bg-muted/40 text-center space-y-1">
                    <p className="text-xs text-foreground font-medium">No previous sessions found</p>
                    <p className="text-[11px] text-muted-foreground">Your chat history will be listed here.</p>
                  </div>
                )}

                {!isLoadingSessions && userSessions && userSessions.length > 0 && (
                  <div className="space-y-2">
                    {userSessions.map((s) => {
                      const isCurrent = String(s.id) === activeSessionId
                      const dateLabel = formatShortDate(s.created_at)

                      return (
                        <div
                          key={s.id}
                          onClick={() => navigate(ROUTES.CHAT.SESSION(String(s.id)))}
                          className={`p-3 rounded-xl border transition-all cursor-pointer select-none space-y-1 ${
                            isCurrent
                              ? 'bg-amber-500/10 border-amber-500/40 text-foreground shadow-sm'
                              : 'bg-muted/50 border-border hover:bg-muted text-foreground'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold truncate max-w-[200px]">
                              {s.title || `Session #${s.id}`}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1.5 py-0 ${
                                s.status === 'escalated'
                                  ? 'border-amber-500/40 text-amber-600 dark:text-amber-300 bg-amber-500/10'
                                  : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10'
                              }`}
                            >
                              {s.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                            <span>{dateLabel}</span>
                            {isCurrent && (
                              <span className="text-amber-500 dark:text-amber-400 font-bold flex items-center gap-1">
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                                Active Now
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Section 2: Quick Actions */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Quick Support Actions
                </h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate(ROUTES.EMERGENCY.HELP)}
                    variant="outline"
                    className="w-full justify-start text-xs bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 gap-2 h-10 rounded-xl"
                  >
                    <HugeiconsIcon icon={LifebuoyIcon} className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                    <span>Access 24/7 Emergency Helplines</span>
                  </Button>
                </div>
              </div>

              {/* Section 3: AI Safety & Clinical Disclaimer */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span>AI Companion Safety Notice</span>
                </div>
                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/10 space-y-1.5">
                  <h5 className="text-xs font-bold text-foreground font-serif">
                    Supportive Tool, Not Clinical Healthcare
                  </h5>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                    Kintsugi provides CBT-informed reflective conversation for self-awareness. It does not provide medical diagnosis, therapy, or emergency response.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </div>
    </Sheet>
  )
}

export default ChatWindow
