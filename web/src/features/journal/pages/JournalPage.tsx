import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'

import { JournalList } from '../components/JournalList'
import { JournalEditor } from '../components/JournalEditor'
import { useJournalEntries } from '../hooks/useJournalEntries'
import type { JournalEntry } from '@/types/api'
import { Sparkles } from 'lucide-react'
import { SemanticSearchModal } from '@/features/ml/components/SemanticSearchModal'

export type ViewMode = 'list' | 'editor'

export const JournalPage: React.FC = () => {
  const { data: entriesData } = useJournalEntries({ userId: 'me' })
  /* Local View Navigation State */
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [activeSessionKey, setActiveSessionKey] = useState<string>(() => 'session-new-' + Date.now())
  const [mobileViewMode, setMobileViewMode] = useState<ViewMode>('list')

  /* Select Entry Handler */
  const handleSelectEntry = useCallback((entry: JournalEntry) => {
    setSelectedEntry(entry)
    setActiveSessionKey('session-' + entry.id)
    setMobileViewMode('editor')
  }, [])

  /* Start New Entry Handler */
  const handleNewEntry = useCallback(() => {
    setSelectedEntry(null)
    setActiveSessionKey('session-new-' + Date.now())
    setMobileViewMode('editor')
  }, [])

  /* Save Success Callback (preserves activeSessionKey!) */
  const handleSaveSuccess = useCallback((savedEntry: JournalEntry) => {
    setSelectedEntry(savedEntry)
  }, [])

  /* Delete Success Callback */
  const handleDeleteSuccess = useCallback(() => {
    setSelectedEntry(null)
    setActiveSessionKey('session-new-' + Date.now())
    setMobileViewMode('list')
  }, [])

  /* Mobile Back to List Handler */
  const handleBackToList = useCallback(() => {
    setMobileViewMode('list')
  }, [])

  /* Keyboard Shortcuts listener (Ctrl + N for New Journal) */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        handleNewEntry()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNewEntry])

  const [isSemanticSearchOpen, setIsSemanticSearchOpen] = useState(false)

  return (
    <div className="h-[calc(100vh-4.5rem)] overflow-hidden bg-background text-foreground p-3 sm:p-5 w-full flex flex-col space-y-4 select-none font-sans transition-colors duration-250">
      {/* Fixed Page Header Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border shrink-0">
        <div className="space-y-0.5 text-left">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
            Journal
          </h1>
          <p className="text-xs text-muted-foreground font-sans">
            A quiet space to reflect, write, and capture your thoughts.
          </p>
        </div>

        {/* Action Controls & New Journal Button */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <Button
            onClick={() => setIsSemanticSearchOpen(true)}
            variant="outline"
            className="glass-panel text-amber-300 border-amber-500/30 hover:border-amber-500/60 rounded-xl px-3 h-9 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Semantic ML Search</span>
          </Button>

          {mobileViewMode === 'editor' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToList}
              className="lg:hidden bg-muted border-border text-foreground hover:bg-muted/80 rounded-xl px-3 h-9 gap-1.5 text-xs cursor-pointer transition-colors"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
              <span>Back</span>
            </Button>
          )}

          <Button
            onClick={handleNewEntry}
            className="bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl px-4 h-9 shadow-md shadow-amber-500/20 transition-all gap-2 border border-amber-300/40 text-xs sm:text-sm cursor-pointer"
          >
            <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 text-zinc-950" />
            <span>New Journal</span>
            <kbd className="hidden sm:inline-block text-[10px] bg-amber-700/30 text-amber-950 dark:text-amber-100 px-1.5 py-0.5 rounded font-mono">
              Ctrl+N
            </kbd>
          </Button>
        </div>
      </header>

      {/* Fixed 12-Column Layout Container (Zero Page Scrolling) */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 flex-1 min-h-0 overflow-hidden items-stretch">
        {/* Persistent Sidebar (Column Span 4 of 12) */}
        <aside
          className={`lg:col-span-4 h-full min-h-0 overflow-hidden ${
            mobileViewMode === 'editor' ? 'hidden lg:block' : 'block'
          }`}
        >
          <JournalList
            userId="me"
            selectedEntryId={selectedEntry?.id}
            onSelectEntry={handleSelectEntry}
            onDeleteSuccess={handleDeleteSuccess}
            className="h-full"
          />
        </aside>

        {/* Persistent Editor Canvas (Column Span 8 of 12) */}
        <section
          className={`lg:col-span-8 h-full overflow-hidden ${
            mobileViewMode === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSessionKey}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="h-full"
            >
              <JournalEditor
                initialEntry={selectedEntry}
                userId="me"
                onSaveSuccess={handleSaveSuccess}
                onDeleteSuccess={handleDeleteSuccess}
                className="h-full"
              />
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* Mobile Floating Action Button (FAB) */}
      {mobileViewMode === 'list' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-6 right-6 lg:hidden z-40"
        >
          <Button
            onClick={handleNewEntry}
            size="lg"
            className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 shadow-2xl shadow-amber-950/60 border border-amber-400/40 flex items-center justify-center p-0 cursor-pointer font-bold"
            aria-label="New Journal Entry"
          >
            <HugeiconsIcon icon={Add01Icon} className="w-6 h-6 text-zinc-950" />
          </Button>
        </motion.div>
      )}
      {/* Semantic Search Modal */}
      <SemanticSearchModal
        isOpen={isSemanticSearchOpen}
        onClose={() => setIsSemanticSearchOpen(false)}
        entries={entriesData || []}
      />
    </div>
  )
}

export default JournalPage
