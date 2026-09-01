import React, { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Clock01Icon } from '@hugeicons/core-free-icons'

import { formatShortDate, formatTime } from '@/lib/utils/formatDate'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { JournalEntry } from '@/types/api'

export interface JournalEntryCardProps {
  entry: JournalEntry
  isSelected?: boolean
  onSelect?: (entry: JournalEntry) => void
  onDelete?: (entryId: string | number) => void
  className?: string
}

export const JournalEntryCard: React.FC<JournalEntryCardProps> = React.memo(
  ({ entry, isSelected = false, onSelect, onDelete, className = '' }) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)

    const dateStr = formatShortDate(entry.created_at)
    const timeStr = formatTime(entry.created_at)

    /* Calculate word count and estimated reading time */
    const wordCount = entry.content ? entry.content.replace(/<[^>]*>?/gm, '').trim().split(/\s+/).filter(Boolean).length : 0
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))

    const handleCardClick = () => {
      onSelect?.(entry)
    }

    const handleDeleteConfirm = () => {
      setIsDeleteDialogOpen(false)
      onDelete?.(entry.id)
    }

    return (
      <>
        <div
          onClick={handleCardClick}
          className="cursor-pointer group select-none text-left"
        >
          <Card
            className={`p-4 rounded-2xl border transition-all duration-200 shadow-sm relative ${
              isSelected
                ? 'bg-amber-500/15 dark:bg-amber-500/10 border-amber-500/50 text-foreground ring-1 ring-amber-500/30'
                : 'bg-muted/40 hover:bg-muted/80 border-border hover:border-amber-500/40 hover:shadow-md text-foreground'
            } ${className}`}
          >
            {/* Title Header */}
            <div className="flex items-start justify-between gap-2">
              <h4
                className={`text-sm font-bold font-serif line-clamp-1 transition-colors ${
                  isSelected ? 'text-amber-600 dark:text-amber-300' : 'text-card-foreground group-hover:text-amber-600 dark:group-hover:text-amber-300'
                }`}
              >
                {entry.title || 'Untitled Reflection'}
              </h4>
            </div>

            {/* Snippet Preview */}
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1.5 font-sans">
              {entry.content?.replace(/<[^>]*>?/gm, '') || 'No content...'}
            </p>

            {/* Metadata Footer: Date, Word Count & Reading Time */}
            <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <div className="flex items-center gap-2 flex-wrap">
                <span>{dateStr} • {timeStr}</span>
                <span className="text-muted-foreground/60">•</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <HugeiconsIcon icon={Clock01Icon} className="w-3 h-3 text-muted-foreground" />
                  {wordCount} words ({readTimeMinutes}m read)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {Boolean((entry as unknown as Record<string, unknown>).mood_tag) && (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[9px] px-1.5 py-0 rounded-full font-sans"
                  >
                    {String((entry as unknown as Record<string, unknown>).mood_tag)}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Delete Confirmation AlertDialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-card border-border text-card-foreground rounded-2xl max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-serif font-bold text-card-foreground">
                Delete Journal Reflection?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed font-sans">
                Are you sure you want to delete <span className="text-foreground font-semibold">"{entry.title || 'Untitled Reflection'}"</span>? This action cannot be undone and will permanently remove this encrypted reflection from your private vault.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="bg-muted border-border text-foreground hover:bg-muted/80 rounded-xl text-xs h-9 cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs h-9 shadow-md cursor-pointer border border-rose-500/20"
              >
                Delete Entry
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  },
)

JournalEntryCard.displayName = 'JournalEntryCard'

export default JournalEntryCard
