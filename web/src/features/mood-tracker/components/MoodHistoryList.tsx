import React, { useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVirtualizer } from '@tanstack/react-virtual'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SparklesIcon,
  Calendar01Icon,
  Clock01Icon,
  HeartIcon,
  Note01Icon,
} from '@hugeicons/core-free-icons'

import { useMoodHistory } from '@/features/mood-tracker/hooks/useMoodHistory'
import { getMoodEmoji, getMoodLabel } from '@/lib/constants/moodOptions'
import { formatRelativeDay, formatTime } from '@/lib/utils/formatDate'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { MoodEntry } from '@/types/api'

export interface MoodHistoryListProps {
  userId?: string
  limit?: number
  onSelectEntry?: (entry: MoodEntry) => void
  className?: string
}

export const MoodHistoryList: React.FC<MoodHistoryListProps> = ({
  userId = 'me',
  limit = 100,
  onSelectEntry,
  className = '',
}) => {
  const { data: history, isLoading } = useMoodHistory({
    userId,
    params: { skip: 0, limit },
  })

  const scrollRef = useRef<HTMLDivElement>(null)

  const entries = useMemo(() => history ?? [], [history])
  const shouldVirtualize = entries.length > 15

  /* Virtualizer configuration for scalable long history lists */
  const rowVirtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 100,
    overscan: 5,
    enabled: shouldVirtualize,
  })

  return (
    <Card className={`overflow-hidden border-border bg-card shadow-sm text-left rounded-lg flex flex-col transition-colors duration-250 ${className}`}>
      <CardHeader className="p-5 sm:p-6 pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-600/15 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400">
            <HugeiconsIcon icon={Calendar01Icon} className="w-4.5 h-4.5" />
          </div>
          <CardTitle className="text-base sm:text-lg font-bold text-card-foreground">
            Mood History
          </CardTitle>
        </div>
        {entries.length > 0 && (
          <Badge variant="secondary" className="bg-muted border border-border text-muted-foreground text-[11px] px-2.5 py-0.5 rounded-md">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-0 flex-1">
        <AnimatePresence mode="wait">
          {/* ── State 1: Skeleton Loading Placeholder ── */}
          {isLoading && !history && (
            <motion.div
              key="loading-skeletons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 py-2"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-9 h-9 rounded-xl bg-muted" />
                      <Skeleton className="w-24 h-4 bg-muted" />
                    </div>
                    <Skeleton className="w-16 h-3 bg-muted" />
                  </div>
                  <Skeleton className="w-full h-3 bg-muted/60" />
                </div>
              ))}
            </motion.div>
          )}

          {/* ── State 2: Empty State (No Entries Logged) ── */}
          {!isLoading && entries.length === 0 && (
            <motion.div
              key="empty-history"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <EmptyState
                icon={<HugeiconsIcon icon={HeartIcon} className="w-8 h-8 text-violet-500 dark:text-violet-400" />}
                title="No Mood History Yet"
                description="Your mood journey starts here. Log your first mood to begin tracking."
                size="sm"
              />
            </motion.div>
          )}

          {/* ── State 3: Populated List (Virtualized when >15 items) ── */}
          {!isLoading && entries.length > 0 && (
            <motion.div
              key="history-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ScrollArea className="h-[340px] sm:h-[380px] pr-3" ref={scrollRef}>
                {shouldVirtualize ? (
                  <div
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const entry = entries[virtualRow.index]
                      return (
                        <div
                          key={entry.id}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                          className="pb-2.5"
                        >
                          <MoodEntryCard entry={entry} onSelect={onSelectEntry} />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-2.5 pb-2">
                    {entries.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.04 }}
                      >
                        <MoodEntryCard entry={entry} onSelect={onSelectEntry} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

/* ─── Sub-Component: Individual Entry Card ─── */
interface MoodEntryCardProps {
  entry: MoodEntry
  onSelect?: (entry: MoodEntry) => void
}

const MoodEntryCard: React.FC<MoodEntryCardProps> = ({ entry, onSelect }) => {
  const emoji = getMoodEmoji(entry.mood_type)
  const label = getMoodLabel(entry.mood_type)
  const relativeDay = formatRelativeDay(entry.entry_date || entry.created_at)
  const timeStr = formatTime(entry.created_at || entry.entry_date)

  return (
    <div
      onClick={() => onSelect?.(entry)}
      className={`group p-3.5 rounded-lg border border-border bg-muted/40 hover:bg-muted/80 hover:border-violet-500/30 transition-all duration-200 ${
        onSelect ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Mood Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-background border border-border group-hover:border-violet-500/30 flex items-center justify-center text-xl shadow-inner transition-colors">
            {emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-card-foreground group-hover:text-violet-500 dark:group-hover:text-violet-300 transition-colors">
                {label}
              </span>
              {entry.ai_message && (
                <span className="px-1.5 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-600 dark:text-violet-400 font-medium flex items-center gap-0.5">
                  <HugeiconsIcon icon={SparklesIcon} className="w-3 h-3 text-violet-500 dark:text-violet-400" />
                  <span>AI</span>
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
              <HugeiconsIcon icon={Clock01Icon} className="w-3 h-3" />
              <span>{timeStr}</span>
            </span>
          </div>
        </div>

        {/* Relative Date Label */}
        <span className="text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-1 rounded-md border border-border">
          {relativeDay}
        </span>
      </div>

      {/* Optional Personal Note Preview */}
      {entry.note && (
        <div className="mt-2.5 pt-2 border-t border-border flex items-start gap-1.5 text-xs text-muted-foreground leading-relaxed">
          <HugeiconsIcon icon={Note01Icon} className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="line-clamp-2 italic">{entry.note}</p>
        </div>
      )}
    </div>
  )
}

export default MoodHistoryList
