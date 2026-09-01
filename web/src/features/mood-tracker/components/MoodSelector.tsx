import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SentIcon,
  PencilEdit02Icon,
  Loading03Icon,
  CheckmarkCircle02Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons'

import { MOOD_OPTIONS, type MoodId } from '@/lib/constants/moodOptions'
import { MoodEmojiAnimated } from '@/components/animated/MoodEmojiAnimated'
import { useLogMood } from '@/features/mood-tracker/hooks/useLogMood'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export interface MoodSelectorProps {
  userId?: string
  onSuccess?: () => void
  className?: string
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  userId = 'me',
  onSuccess,
  className = '',
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null)
  const [note, setNote] = useState('')

  const { mutate: logMood, isPending } = useLogMood({
    userId,
    onSuccess: () => {
      toast.success('Mood logged successfully.', {
        description: 'Your check-in has been recorded and AI support is generating.',
        icon: <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-emerald-400" />,
      })
      setSelectedMood(null)
      setNote('')
      onSuccess?.()
    },
    onError: (err) => {
      toast.error('Failed to log mood', {
        description: err.message || 'Please check your connection and try again.',
      })
    },
  })

  const handleSelectMood = useCallback((moodId: MoodId) => {
    setSelectedMood(moodId)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMood || isPending) return

    logMood({
      mood_type: selectedMood,
      note: note.trim() ? note.trim() : null,
      entry_date: new Date().toISOString().split('T')[0],
    })
  }

  const selectedOption = MOOD_OPTIONS.find((o) => o.id === selectedMood)

  return (
    <Card className={`overflow-hidden border-border bg-card shadow-sm rounded-lg transition-colors duration-250 ${className}`}>
      <CardHeader className="p-5 sm:p-6 pb-3 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-600/15 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400">
              <HugeiconsIcon icon={SparklesIcon} className="w-4.5 h-4.5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-card-foreground">
                Daily Mood Check-In
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                How are you feeling right now?
              </CardDescription>
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/60 px-2.5 py-1 rounded-md border border-border">
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-2 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── 6 Canonical Mood Options Grid ── */}
          <div
            role="radiogroup"
            aria-label="Select your current mood"
            className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3"
          >
            {MOOD_OPTIONS.map((option) => (
              <MoodEmojiAnimated
                key={option.id}
                emoji={option.emoji}
                label={option.label}
                selected={selectedMood === option.id}
                disabled={isPending}
                size="md"
                onSelect={() => handleSelectMood(option.id)}
              />
            ))}
          </div>

          {/* ── Selected Mood Confirmation Strip ── */}
          <AnimatePresence>
            {selectedOption && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-violet-500/8 border border-violet-500/15 text-xs">
                  <span className="text-lg">{selectedOption.emoji}</span>
                  <span className="text-muted-foreground">
                    You selected <span className="font-semibold text-violet-600 dark:text-violet-300">{selectedOption.label}</span>
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Optional Note Textarea Input ── */}
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between">
              <label
                htmlFor="mood-note-input"
                className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
              >
                <HugeiconsIcon icon={PencilEdit02Icon} className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
                <span>Reflection Note (Optional)</span>
              </label>
              <span className="text-[10px] text-muted-foreground/80 font-mono tabular-nums">
                {note.length}/1000
              </span>
            </div>
            <Textarea
              id="mood-note-input"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 1000))}
              placeholder="What triggered this emotion? Write a brief reflection..."
              disabled={isPending}
              rows={3}
              className="resize-none bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:border-violet-500/50 focus-visible:ring-violet-500/15 rounded-xl text-xs leading-relaxed transition-all"
            />
          </div>

          {/* ── Action Submit Button ── */}
          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={!selectedMood || isPending}
              className="w-full sm:w-auto h-10 px-6 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-600/20 transition-all gap-2 border border-violet-400/15 text-xs sm:text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <AnimatePresence mode="wait">
                {isPending ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 animate-spin" />
                    <span>Logging Check-In...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="submit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span>Log Mood Entry</span>
                    <HugeiconsIcon icon={SentIcon} className="w-4 h-4 text-violet-200" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default MoodSelector
