/**
 * moodOptions.ts — Single Source of Truth for Mood Definitions.
 *
 * Architectural & Design Rationale:
 *
 * 1. Why Mood Definitions Are Centralized:
 *    - Prevents duplication across Mood Trackers, Selection Buttons, History Cards,
 *      Recharts Analytics, Forms, and AI Summaries.
 *    - Ensures exact alignment with backend `MoodType` enum values ("happy", "calm", "sad", etc.).
 *
 * 2. Why Charts Use Numeric Values:
 *    - Recharts and analytics engines require ordinal values (1 to 6) to render trend lines,
 *      moving averages, and emotional trajectory graphs without custom data conversion.
 *
 * 3. Why Immutable Configuration Prevents Inconsistencies:
 *    - Freezing the array (`as const` / `Object.freeze`) prevents runtime mutation side effects
 *      and enforces compile-time type safety for mood IDs.
 *
 * 4. How Future Moods Should Be Added Safely:
 *    - First update backend `MoodType` enum in `backend/app/core/constants.py`.
 *    - Then add the new entry to `MOOD_OPTIONS` below with its corresponding emoji, numeric value,
 *      and Tailwind theme token.
 */

export type MoodId = 'happy' | 'calm' | 'sad' | 'angry' | 'anxious' | 'tired'

export interface MoodOption {
  readonly id: MoodId
  readonly emoji: string
  readonly label: string
  readonly value: number
  readonly color: string
}

export const MOOD_OPTIONS: readonly MoodOption[] = Object.freeze([
  {
    id: 'happy',
    emoji: '😊',
    label: 'Happy',
    value: 5,
    color: 'gold',
  },
  {
    id: 'calm',
    emoji: '😌',
    label: 'Calm',
    value: 6,
    color: 'amber',
  },
  {
    id: 'sad',
    emoji: '😢',
    label: 'Sad',
    value: 2,
    color: 'purple',
  },
  {
    id: 'angry',
    emoji: '😠',
    label: 'Angry',
    value: 1,
    color: 'rose',
  },
  {
    id: 'anxious',
    emoji: '😰',
    label: 'Anxious',
    value: 3,
    color: 'violet',
  },
  {
    id: 'tired',
    emoji: '😫',
    label: 'Tired',
    value: 4,
    color: 'zinc',
  },
])

/* ─── Fast O(1) Constant Time Lookup Map ─── */
const MOOD_MAP = new Map<string, MoodOption>(
  MOOD_OPTIONS.map((m) => [m.id, m]),
)

/**
 * Retrieve a mood definition by its backend identifier string.
 */
export function getMoodById(id: string): MoodOption | undefined {
  if (!id) return undefined
  const normalized = id.toLowerCase().trim()
  return MOOD_MAP.get(normalized)
}

/**
 * Retrieve the theme color token for a given mood ID (defaults to 'zinc').
 */
export function getMoodColor(id: string): string {
  return getMoodById(id)?.color ?? 'zinc'
}

/**
 * Retrieve the emoji representation for a given mood ID (defaults to '🙂').
 */
export function getMoodEmoji(id: string): string {
  return getMoodById(id)?.emoji ?? '🙂'
}

/**
 * Retrieve the human-readable label for a given mood ID (defaults to capitalized ID or 'Unknown').
 */
export function getMoodLabel(id: string): string {
  const found = getMoodById(id)
  if (found) return found.label
  return id ? id.charAt(0).toUpperCase() + id.slice(1) : 'Unknown'
}

/**
 * Check whether a string represents a valid MoodId in the application.
 */
export function isValidMood(id: string): boolean {
  if (!id) return false
  return MOOD_MAP.has(id.toLowerCase().trim())
}

/* Alias for backward compatibility */
export const moodOptions = MOOD_OPTIONS

export default MOOD_OPTIONS
