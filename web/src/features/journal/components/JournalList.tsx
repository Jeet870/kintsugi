import React, { useRef, useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  isToday,
  isYesterday,
  isSameWeek,
  isSameMonth,
  subMonths,
} from 'date-fns'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PencilEdit02Icon,
  Search01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from '@hugeicons/core-free-icons'

import { useJournalEntries } from '@/features/journal/hooks/useJournalEntries'
import { useDeleteJournalEntry } from '@/features/journal/hooks/useDeleteJournalEntry'
import { JournalEntryCard } from './JournalEntryCard'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { JournalEntry } from '@/types/api'

export interface JournalListProps {
  userId?: string
  limit?: number
  selectedEntryId?: string | number | null
  onSelectEntry?: (entry: JournalEntry) => void
  onDeleteSuccess?: (entryId: string | number) => void
  className?: string
}

export const JournalList: React.FC<JournalListProps> = React.memo(
  ({
    userId = 'me',
    limit = 100,
    selectedEntryId,
    onSelectEntry,
    onDeleteSuccess,
    className = '',
  }) => {
    const [rawSearchQuery, setRawSearchQuery] = useState<string>('')
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('')
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

    /* 300ms Debounce search input */
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedSearchQuery(rawSearchQuery)
      }, 300)
      return () => clearTimeout(handler)
    }, [rawSearchQuery])

    const { data: entriesData, isLoading, isError, error } = useJournalEntries({
      userId,
      params: { skip: 0, limit },
    })

    const { mutate: deleteEntry } = useDeleteJournalEntry({
      userId,
      onSuccess: () => {
        toast.success('Journal reflection deleted.')
      },
      onError: (err) => {
        toast.error(`Failed to delete entry: ${err.message}`)
      },
    })

    const scrollRef = useRef<HTMLDivElement>(null)

    /* Filter entries based on search query */
    const entries = useMemo(() => {
      const list = entriesData ?? []
      if (!debouncedSearchQuery.trim()) return list
      const q = debouncedSearchQuery.toLowerCase()
      return list.filter(
        (e) =>
          (e.title && e.title.toLowerCase().includes(q)) ||
          (e.content && e.content.toLowerCase().includes(q)),
      )
    }, [entriesData, debouncedSearchQuery])

    /* Dynamic date-fns Timeline Grouping: Today, Yesterday, This Week, Earlier This Month, Last Month, Older */
    const groupedEntries = useMemo(() => {
      const groups: Record<string, JournalEntry[]> = {
        Today: [],
        Yesterday: [],
        'This Week': [],
        'Earlier This Month': [],
        'Last Month': [],
        Older: [],
      }

      const now = new Date()
      const lastMonth = subMonths(now, 1)

      entries.forEach((entry) => {
        const date = new Date(entry.created_at)
        if (isNaN(date.getTime())) {
          groups['Older'].push(entry)
          return
        }

        if (isToday(date)) {
          groups['Today'].push(entry)
        } else if (isYesterday(date)) {
          groups['Yesterday'].push(entry)
        } else if (isSameWeek(date, now, { weekStartsOn: 1 })) {
          groups['This Week'].push(entry)
        } else if (isSameMonth(date, now)) {
          groups['Earlier This Month'].push(entry)
        } else if (isSameMonth(date, lastMonth)) {
          groups['Last Month'].push(entry)
        } else {
          groups['Older'].push(entry)
        }
      })

      return groups
    }, [entries])

    const handleDeleteEntry = (entryId: string | number) => {
      deleteEntry(entryId)
      onDeleteSuccess?.(entryId)
    }

    const toggleGroupCollapse = (groupName: string) => {
      setCollapsedGroups((prev) => ({
        ...prev,
        [groupName]: !prev[groupName],
      }))
    }

    return (
      <Card
        className={`overflow-hidden border border-border bg-card shadow-sm text-left flex flex-col h-full transition-colors duration-250 ${className}`}
      >
        {/* Sticky Search Header */}
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border bg-muted/40 sticky top-0 z-20 space-y-0">
          <div className="relative w-full">
            <HugeiconsIcon
              icon={Search01Icon}
              className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
            />
            <Input
              value={rawSearchQuery}
              onChange={(e) => setRawSearchQuery(e.target.value)}
              placeholder="Search entries (Ctrl + F)..."
              className="pl-8 bg-background border-border text-foreground placeholder:text-muted-foreground hover:border-amber-500/50 focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500/20 rounded-xl text-xs h-9 transition-all w-full"
            />
          </div>
        </CardHeader>

        {/* Scrollable Timeline Container (INDEPENDENT SCROLLING) */}
        <CardContent className="p-4 sm:p-5 flex-1 flex flex-col min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Loading Skeleton States */}
            {isLoading && !entriesData && (
              <motion.div
                key="loading-skeletons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 py-2"
              >
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-muted/30 space-y-2.5">
                    <Skeleton className="w-3/4 h-4 bg-muted" />
                    <Skeleton className="w-full h-3.5 bg-muted/60" />
                    <Skeleton className="w-1/2 h-3 bg-muted/40" />
                  </div>
                ))}
              </motion.div>
            )}

            {/* Error State */}
            {isError && !isLoading && (
              <motion.div
                key="error-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-5 text-center text-xs text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl"
              >
                Failed to load journal reflections: {error?.message || 'Please check your connection.'}
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && entries.length === 0 && (
              <motion.div
                key="empty-journal"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-8 my-auto"
              >
                <EmptyState
                  icon={<HugeiconsIcon icon={PencilEdit02Icon} className="w-8 h-8 text-amber-500 dark:text-amber-400" />}
                  title="Your story begins here."
                  description={
                    debouncedSearchQuery
                      ? 'No reflections match your search query.'
                      : 'Your quiet space is waiting. Write your first reflection.'
                  }
                  size="sm"
                />
              </motion.div>
            )}

            {/* Grouped Collapsible Timeline List */}
            {!isLoading && !isError && entries.length > 0 && (
              <motion.div
                key="journal-grouped-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-4 pb-3" ref={scrollRef}>
                  {Object.entries(groupedEntries).map(([sectionTitle, groupList]) => {
                    if (groupList.length === 0) return null
                    const isCollapsed = collapsedGroups[sectionTitle]

                    return (
                      <div key={sectionTitle} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => toggleGroupCollapse(sectionTitle)}
                          className="w-full flex items-center justify-between py-1 px-1 text-[11px] font-semibold tracking-wider text-muted-foreground hover:text-foreground font-sans uppercase transition-colors cursor-pointer select-none"
                        >
                          <span>
                            {sectionTitle} ({groupList.length})
                          </span>
                          <HugeiconsIcon
                            icon={isCollapsed ? ArrowDown01Icon : ArrowUp01Icon}
                            className="w-3 h-3 text-muted-foreground"
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {!isCollapsed && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.15 }}
                              className="space-y-2.5"
                            >
                              {groupList.map((entry) => (
                                <JournalEntryCard
                                  key={entry.id}
                                  entry={entry}
                                  isSelected={String(entry.id) === String(selectedEntryId)}
                                  onSelect={onSelectEntry}
                                  onDelete={handleDeleteEntry}
                                />
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sticky Sidebar Counter Footer */}
          {!isLoading && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-sans shrink-0">
              <span>
                {entries.length} {entries.length === 1 ? 'entry total' : 'entries total'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  },
)

JournalList.displayName = 'JournalList'

export default JournalList
