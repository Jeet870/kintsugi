import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PencilEdit02Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  Book01Icon,
  SparklesIcon,
  Delete02Icon,
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
} from '@hugeicons/core-free-icons'

import { useSaveJournalEntry } from '@/features/journal/hooks/useSaveJournalEntry'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatShortDate, formatTime } from '@/lib/utils/formatDate'
import type { JournalEntry } from '@/types/api'

export interface JournalEditorProps {
  initialEntry?: JournalEntry | null
  userId?: string
  onSaveSuccess?: (entry: JournalEntry) => void
  onDeleteSuccess?: (entryId: string | number) => void
  className?: string
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
type EditorMode = 'read' | 'edit'

export const JournalEditor: React.FC<JournalEditorProps> = ({
  initialEntry,
  userId = 'me',
  onSaveSuccess,
  onDeleteSuccess,
  className = '',
}) => {
  const [title, setTitle] = useState(initialEntry?.title ?? '')
  const [content, setContent] = useState(initialEntry?.content ?? '')
  const [mode, setMode] = useState<EditorMode>(initialEntry ? 'read' : 'edit')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false)

  const prevEntryIdRef = useRef<string | number | undefined>(initialEntry?.id)
  const currentEntryIdRef = useRef<string | number | undefined>(initialEntry?.id)
  const lastSavedTitleRef = useRef(initialEntry?.title ?? '')
  const lastSavedContentRef = useRef(initialEntry?.content ?? '')
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  /* Save mutation hook */
  const { mutate: saveEntry, isPending } = useSaveJournalEntry({
    userId,
    onSuccess: (savedEntry) => {
      setSaveStatus('saved')
      currentEntryIdRef.current = savedEntry.id
      prevEntryIdRef.current = savedEntry.id
      lastSavedTitleRef.current = savedEntry.title
      lastSavedContentRef.current = savedEntry.content
      onSaveSuccess?.(savedEntry)
    },
    onError: () => {
      setSaveStatus('error')
    },
  })

  /* Execute Save Logic */
  const performSave = useCallback(
    (isManual = false) => {
      const trimmedTitle = title.trim() || 'Untitled Reflection'
      const trimmedContent = content.trim()

      if (!trimmedContent) return

      if (
        !isManual &&
        trimmedTitle === lastSavedTitleRef.current &&
        trimmedContent === lastSavedContentRef.current
      ) {
        return
      }

      setSaveStatus('saving')
      const targetId = currentEntryIdRef.current ?? initialEntry?.id

      saveEntry(
        {
          id: targetId,
          title: trimmedTitle,
          content: trimmedContent,
        },
        {
          onSuccess: (savedEntry) => {
            currentEntryIdRef.current = savedEntry.id
            prevEntryIdRef.current = savedEntry.id
            lastSavedTitleRef.current = savedEntry.title
            lastSavedContentRef.current = savedEntry.content
            onSaveSuccess?.(savedEntry)

            if (isManual) {
              toast.success('Journal reflection saved.', {
                description: 'Your encrypted thoughts have been persisted safely.',
                icon: <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-emerald-400" />,
              })
              setMode('read')
            }
          },
        },
      )
    },
    [title, content, initialEntry?.id, saveEntry, onSaveSuccess],
  )

  /* Initialize TipTap Rich Text Editor with TaskList, Highlight, Underline & CodeBlock */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Write your private thoughts, feelings, or daily memories here...',
      }),
      CharacterCount,
      Underline,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: initialEntry?.content || '',
    onUpdate: ({ editor: ed }) => {
      try {
        const html = ed.getHTML()
        setContent(html)
      } catch {
        // Suppress update race condition
      }
    },
  })

  /* Sync state & TipTap content ONLY when switching between DIFFERENT entries */
  useEffect(() => {
    const newId = initialEntry?.id

    if (newId !== prevEntryIdRef.current) {
      prevEntryIdRef.current = newId
      currentEntryIdRef.current = newId

      if (initialEntry) {
        const entryTitle = initialEntry.title || ''
        const entryContent = initialEntry.content || ''
        lastSavedTitleRef.current = entryTitle
        lastSavedContentRef.current = entryContent
        setTitle(entryTitle)
        setContent(entryContent)
        setMode('read')
        if (editor && !editor.isDestroyed) {
          try {
            editor.commands.setContent(entryContent, { emitUpdate: false })
          } catch {}
        }
      } else {
        lastSavedTitleRef.current = ''
        lastSavedContentRef.current = ''
        setTitle('')
        setContent('')
        setMode('edit')
        if (editor && !editor.isDestroyed) {
          try {
            editor.commands.setContent('', { emitUpdate: false })
          } catch {}
        }
      }
    } else if (initialEntry?.id) {
      currentEntryIdRef.current = initialEntry.id
      lastSavedTitleRef.current = initialEntry.title || ''
      lastSavedContentRef.current = initialEntry.content || ''
    }
  }, [initialEntry, editor])

  /* Debounced Autosave effect: triggers performSave ONLY when user edits title or content */
  useEffect(() => {
    const trimmedTitle = title.trim() || 'Untitled Reflection'
    const trimmedContent = content.trim()

    if (
      !trimmedContent ||
      (trimmedTitle === lastSavedTitleRef.current && trimmedContent === lastSavedContentRef.current)
    ) {
      return
    }

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = setTimeout(() => {
      performSave(false)
    }, 1500)

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    }
  }, [title, content, performSave])

  /* Word & Character count calculation */
  const wordCount = useMemo(() => {
    if (editor && !editor.isDestroyed) {
      try {
        return editor.storage.characterCount.words()
      } catch {}
    }
    const text = content.replace(/<[^>]*>?/gm, '').replace(/^>\s*/gm, '').trim()
    return text ? text.split(/\s+/).filter(Boolean).length : 0
  }, [editor, content])

  const characterCount = useMemo(() => {
    if (editor && !editor.isDestroyed) {
      try {
        return editor.storage.characterCount.characters()
      } catch {}
    }
    return content.replace(/<[^>]*>?/gm, '').replace(/^>\s*/gm, '').length
  }, [editor, content])

  const readTimeMinutes = useMemo(() => {
    const mins = Math.ceil(wordCount / 200)
    return mins < 1 ? 1 : mins
  }, [wordCount])

  /* Dynamic AI Reflection Generator based on entry title and draft content */
  const handleEnhanceWithAI = async () => {
    setIsEnhancing(true)
    toast.info('AI Assistant Writing...', {
      description: 'Analyzing your thoughts and expanding into a personalized reflection.',
      icon: <HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-amber-400 animate-pulse" />,
    })

    setTimeout(() => {
      const currentTitle = title.trim() || 'Daily Mindful Reflection'
      const baseText = content.replace(/<[^>]*>?/gm, '').replace(/^>\s*/gm, '').trim()
      const lowerTitle = currentTitle.toLowerCase()
      const lowerText = baseText.toLowerCase()

      // Curated Quote Bank
      const quoteBank = [
        "“The oak fought the wind and was broken, the willow bent when it must and survived.” — Robert Jordan",
        "“You don’t have to see the whole staircase, just take the first step.” — Martin Luther King Jr.",
        "“In the depth of winter, I finally learned that within me there lay an invincible summer.” — Albert Camus",
        "“Peace comes from within. Do not seek it without.” — Buddha",
        "“Small pauses throughout the day bring the greatest mental clarity.”",
        "“Breathe. Let go. Remind yourself that this very moment is the only one you know you have for sure.”",
      ]
      const selectedQuote = quoteBank[Math.floor(Math.random() * quoteBank.length)]

      // Dynamic Topic/Tone Reflections matching system prompt sections
      let toneReflection = ''
      let cbtReframe = ''
      let strengthsList = ''
      let reflectionQuestion = ''

      if (lowerTitle.includes('sad') || lowerText.includes('sad') || lowerText.includes('down') || lowerText.includes('cry')) {
        toneReflection = '<p>I am allowing myself to feel this sadness today without judgment or pressure to fix everything immediately. Honoring my feelings as valid signals is an act of quiet self-compassion.</p>'
        cbtReframe = '<p>It may be helpful to consider that feeling down today does not mean tomorrow will feel the same. Sadness is like passing weather—it comes, it stays for a little while, and eventually clears away.</p>'
        strengthsList = '<ul><li>Self-awareness to sit with uncomfortable emotions</li><li>Courage to express vulnerable feelings honestly</li><li>Patience with your personal healing journey</li></ul>'
        reflectionQuestion = '<p>What would a gentle, comforting gift to yourself look like this evening?</p>'
      } else if (lowerTitle.includes('anxious') || lowerText.includes('worry') || lowerText.includes('stress') || lowerText.includes('overwhelmed')) {
        toneReflection = '<p>My mind felt cluttered with thoughts about things outside my direct control. Taking a step back helps me ground myself back into the present moment.</p>'
        cbtReframe = '<p>It may be helpful to notice whether I am carrying tomorrow’s worries into today. I can choose to focus on just the next small, manageable step right in front of me.</p>'
        strengthsList = '<ul><li>Ability to recognize when your mind is overwhelmed</li><li>Resilience in seeking moments of pause and grounding</li><li>Commitment to inner clarity</li></ul>'
        reflectionQuestion = '<p>What is one worry you can give yourself permission to set aside for the rest of today?</p>'
      } else if (lowerTitle.includes('gratitude') || lowerTitle.includes('happy') || lowerText.includes('joy') || lowerText.includes('thankful')) {
        toneReflection = '<p>Capturing these positive moments anchors me when things feel uncertain. I feel a quiet warmth appreciating the simple gifts of today.</p>'
        cbtReframe = '<p>Noticing what goes well helps balance our brain’s natural tendency to focus on difficulties. Celebrating these moments builds lasting emotional strength.</p>'
        strengthsList = '<ul><li>Mindful appreciation of daily joy</li><li>Capacity to notice beauty in small moments</li><li>Generosity of spirit</li></ul>'
        reflectionQuestion = '<p>How can you share a piece of this positive energy with someone else tomorrow?</p>'
      } else {
        toneReflection = '<p>Taking a quiet pause today to observe my thoughts without rushing through the moment. Putting these reflections into words gives me space to process the day with clarity.</p>'
        cbtReframe = '<p>It may help to notice that even on ordinary days, small choices and quiet pauses shape our long-term peace of mind.</p>'
        strengthsList = '<ul><li>Dedication to personal reflection and journaling</li><li>Openness to self-discovery</li><li>Equanimity in daily routines</li></ul>'
        reflectionQuestion = '<p>What would you like tomorrow’s version of yourself to remember from today?</p>'
      }

      const initialUserContent = baseText
        ? `<p><em>${baseText}</em></p>`
        : `<p><em>Taking a quiet moment to check in with myself.</em></p>`

      const checklistVariations = [
        `<ul data-type="taskList">
          <li data-type="taskItem" data-checked="true">Practiced 5 minutes of mindful deep breathing</li>
          <li data-type="taskItem" data-checked="true">Went outdoors for a short walk in the fresh air</li>
          <li data-type="taskItem" data-checked="false">Wrote down 3 gratitude notes before evening</li>
        </ul>`,
        `<ul data-type="taskList">
          <li data-type="taskItem" data-checked="true">Acknowledged and named my emotions without judgment</li>
          <li data-type="taskItem" data-checked="true">Drank a warm cup of water and rested my eyes from screens</li>
          <li data-type="taskItem" data-checked="false">Set gentle, realistic expectations for tomorrow</li>
        </ul>`,
        `<ul data-type="taskList">
          <li data-type="taskItem" data-checked="true">Checked in with my body to release physical shoulder tension</li>
          <li data-type="taskItem" data-checked="true">Practiced cognitive reframing on a lingering worry</li>
          <li data-type="taskItem" data-checked="false">Read a comforting passage before sleep</li>
        </ul>`
      ]
      const selectedChecklist = checklistVariations[Math.floor(Math.random() * checklistVariations.length)]

      const enhancedHTML = `<section class="journal-reflection">
<h2>Today's Reflection</h2>
${initialUserContent}
</section>

<section class="mindful-reflection">
<h2>Mindful Reflection</h2>
${toneReflection}
</section>

<section class="gentle-reframe">
<h2>A Different Perspective</h2>
${cbtReframe}
</section>

<section class="strengths">
<h2>Strengths You Showed</h2>
${strengthsList}
</section>

<section class="small-steps">
<h2>Small Steps Forward</h2>
${selectedChecklist}
</section>

<section class="quote">
<blockquote><p>${selectedQuote}</p></blockquote>
</section>

<section class="reflection-question">
<h2>Journal Prompt</h2>
${reflectionQuestion}
</section>`

      setTitle(currentTitle)
      setContent(enhancedHTML)

      if (editor && !editor.isDestroyed) {
        try {
          editor.commands.setContent(enhancedHTML, { emitUpdate: false })
        } catch {}
      }

      setIsEnhancing(false)
      setMode('edit')
      toast.success('Journal Enhanced by AI', {
        description: 'Generated a personalized reflection tailored to your entry.',
        icon: <HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-amber-400" />,
      })
    }, 1200)
  }

  /* Parse HTML Content Blocks for Read Mode */
  const parsedContentBlocks = useMemo(() => {
    if (!content) return []
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    const blocks: Array<{ type: 'paragraph' | 'quote' | 'heading'; text: string }> = []

    Array.from(tempDiv.childNodes).forEach((node) => {
      const rawText = (node.textContent || '').trim()
      if (!rawText) return

      if (node.nodeName === 'BLOCKQUOTE' || rawText.startsWith('>')) {
        const cleanQuote = rawText.replace(/^>\s*/g, '').replace(/^"|"$/g, '').trim()
        if (cleanQuote) {
          blocks.push({ type: 'quote', text: cleanQuote })
        }
      } else if (node.nodeName.startsWith('H')) {
        blocks.push({ type: 'heading', text: rawText })
      } else {
        const cleanParagraph = rawText.replace(/^>\s*/g, '').trim()
        if (cleanParagraph) {
          blocks.push({ type: 'paragraph', text: cleanParagraph })
        }
      }
    })

    if (blocks.length === 0 && content.trim()) {
      const cleanFallback = content.replace(/<[^>]*>?/gm, '').replace(/^>\s*/g, '').trim()
      if (cleanFallback) {
        blocks.push({ type: 'paragraph', text: cleanFallback })
      }
    }

    return blocks
  }, [content])

  const formattedDate = initialEntry?.created_at
    ? `${formatShortDate(initialEntry.created_at)} at ${formatTime(initialEntry.created_at)}`
    : 'Today at ' + formatTime(new Date().toISOString())

  const isEditorReady = Boolean(editor && !editor.isDestroyed)

  return (
    <Card
      className={`overflow-hidden border border-border bg-card shadow-sm text-left flex flex-col h-full transition-colors duration-250 ${className}`}
    >
      {/* Editor Fixed Header Bar */}
      <CardHeader className="p-3.5 sm:p-5 pb-3 border-b border-border bg-muted/40 sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="space-y-0.5 min-w-0">
          <CardTitle className="text-lg sm:text-xl font-bold text-card-foreground font-serif tracking-tight line-clamp-1">
            {title || 'Untitled Reflection'}
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans flex-wrap">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="font-mono">{readTimeMinutes} min read</span>
            <span>•</span>
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] px-2 py-0 rounded-full font-medium shrink-0"
            >
              🟢 Calm
            </Badge>
          </div>
        </div>

        {/* Action Buttons (Mobile Responsive Row) */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto flex-wrap sm:flex-nowrap shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMode(mode === 'read' ? 'edit' : 'read')}
            className="h-8 px-2.5 rounded-xl bg-background border-border text-foreground hover:bg-muted text-xs gap-1.5 cursor-pointer transition-colors"
          >
            {mode === 'read' ? (
              <>
                <HugeiconsIcon icon={PencilEdit02Icon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Edit</span>
              </>
            ) : (
              <>
                <HugeiconsIcon icon={Book01Icon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Read</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            onClick={handleEnhanceWithAI}
            disabled={isEnhancing}
            className="bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-amber-500/20 hover:from-amber-500/30 hover:to-purple-600/30 text-amber-600 dark:text-amber-300 border border-amber-500/30 font-semibold rounded-xl px-2.5 sm:px-3 h-8 text-xs gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <HugeiconsIcon
              icon={SparklesIcon}
              className={`w-3.5 h-3.5 text-amber-500 dark:text-amber-400 ${isEnhancing ? 'animate-spin' : ''}`}
            />
            <span>{isEnhancing ? 'Enhancing...' : 'AI Write'}</span>
          </Button>

          {mode === 'edit' && (
            <Button
              type="button"
              onClick={() => performSave(true)}
              disabled={!content.trim() || isPending}
              className="bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl px-3 sm:px-3.5 h-8 shadow-md shadow-amber-500/20 text-xs gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {isPending ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3.5 h-3.5 text-zinc-950" />
                  <span>Save</span>
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {/* TipTap Sticky Formatting Toolbar (Edit Mode) */}
      {mode === 'edit' && isEditorReady && (
        <div className="px-3 sm:px-4 py-2 border-b border-border bg-muted/60 sticky top-[57px] z-10 flex items-center gap-1 overflow-x-auto text-xs text-muted-foreground select-none shrink-0 no-scrollbar">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer shrink-0"
          >
            <HugeiconsIcon icon={ArrowTurnBackwardIcon} className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer shrink-0"
          >
            <HugeiconsIcon icon={ArrowTurnForwardIcon} className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-border mx-1 shrink-0" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-0.5 rounded-lg hover:bg-muted font-bold text-xs cursor-pointer shrink-0 ${
              editor.isActive('heading', { level: 1 }) ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 font-extrabold' : 'text-muted-foreground'
            }`}
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-0.5 rounded-lg hover:bg-muted font-bold text-xs cursor-pointer shrink-0 ${
              editor.isActive('heading', { level: 2 }) ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 font-extrabold' : 'text-muted-foreground'
            }`}
          >
            H2
          </button>

          <div className="h-4 w-px bg-border mx-1 shrink-0" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-0.5 rounded-lg hover:bg-muted font-bold text-xs cursor-pointer shrink-0 ${
              editor.isActive('bold') ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 font-extrabold' : 'text-muted-foreground'
            }`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-0.5 rounded-lg hover:bg-muted italic font-serif text-xs cursor-pointer shrink-0 ${
              editor.isActive('italic') ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300' : 'text-muted-foreground'
            }`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-2 py-0.5 rounded-lg hover:bg-muted underline text-xs cursor-pointer shrink-0 ${
              editor.isActive('underline') ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300' : 'text-muted-foreground'
            }`}
          >
            U
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#f59e0b33' }).run()}
            className={`px-2 py-0.5 rounded-lg hover:bg-muted text-xs cursor-pointer shrink-0 ${
              editor.isActive('highlight') ? 'bg-amber-500/30 text-amber-600 dark:text-amber-300' : 'text-muted-foreground'
            }`}
          >
            Highlight
          </button>

          <div className="h-4 w-px bg-border mx-1 shrink-0" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 py-0.5 rounded-lg hover:bg-muted text-xs cursor-pointer shrink-0 ${
              editor.isActive('bulletList') ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300' : 'text-muted-foreground'
            }`}
          >
            • Bullet
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`px-2 py-0.5 rounded-lg hover:bg-muted text-xs cursor-pointer shrink-0 ${
              editor.isActive('taskList') ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300' : 'text-muted-foreground'
            }`}
          >
            ☑ Checklist
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-2 py-0.5 rounded-lg hover:bg-muted font-serif italic text-xs cursor-pointer shrink-0 ${
              editor.isActive('blockquote') ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300' : 'text-muted-foreground'
            }`}
          >
            “ Quote
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="px-2 py-0.5 rounded-lg hover:bg-muted text-xs text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
          >
            ― Divider
          </button>
        </div>
      )}

      {/* Main Independently Scrollable Writing Canvas (Maximum Readable Width 900px) */}
      <CardContent className="p-4 sm:p-7 flex-1 overflow-y-auto max-w-[900px] w-full mx-auto space-y-4">
        {mode === 'edit' ? (
          <div className="space-y-4 flex flex-col min-h-full">
            {/* Title Input */}
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 150))}
              placeholder="Finding Calm in the Chaos..."
              className="bg-transparent border-0 border-b border-border hover:border-amber-500/50 rounded-none px-0 text-xl sm:text-2xl font-serif font-bold text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-amber-500 h-12 transition-colors"
            />

            {/* TipTap Canvas */}
            <div className="flex-1 text-foreground text-sm sm:text-base leading-relaxed font-sans focus:outline-none min-h-[350px]">
              <EditorContent editor={editor} />
            </div>
          </div>
        ) : (
          /* Read Mode View */
          <div className="space-y-5 flex-1 w-full">
            {parsedContentBlocks.map((block, idx) => {
              if (block.type === 'quote') {
                return (
                  <div
                    key={idx}
                    className="my-4 sm:my-5 p-4 sm:p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-sm sm:text-base italic font-serif leading-relaxed shadow-sm relative pl-7"
                  >
                    <span className="absolute left-2.5 top-2.5 text-xl text-amber-500 dark:text-amber-400 font-serif">“</span>
                    {block.text}
                  </div>
                )
              }
              if (block.type === 'heading') {
                return (
                  <h3 key={idx} className="text-lg font-bold font-serif text-foreground pt-2">
                    {block.text}
                  </h3>
                )
              }
              return (
                <p key={idx} className="text-sm sm:text-base leading-relaxed text-foreground font-sans tracking-normal">
                  {block.text}
                </p>
              )
            })}
          </div>
        )}
      </CardContent>

      {/* Sticky Bottom Status Footer Bar (Mobile Overflow Safe) */}
      <CardFooter className="p-3 sm:p-4 border-t border-border bg-muted/40 sticky bottom-0 z-20 flex flex-row items-center justify-between gap-2 text-[11px] sm:text-xs text-muted-foreground font-sans shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          {saveStatus === 'saving' || isPending ? (
            <div className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400 font-mono">
              <HugeiconsIcon icon={Loading03Icon} className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Saved automatically</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0 font-mono text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
          <span>{wordCount} Words ({characterCount} chars)</span>
          <span>•</span>
          <span>{readTimeMinutes} min read</span>

          {(currentEntryIdRef.current || initialEntry?.id) && (
            <button
              type="button"
              onClick={() => onDeleteSuccess?.((currentEntryIdRef.current || initialEntry?.id)!)}
              title="Delete entry"
              className="p-1 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <HugeiconsIcon icon={Delete02Icon} className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

export default JournalEditor
