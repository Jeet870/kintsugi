import { format, isToday, isYesterday, parseISO, isValid } from 'date-fns'

/**
 * formatDate.ts — Centralized Application Date & Time Formatting Utilities.
 *
 * Architectural Rationale:
 *
 * 1. Why Formatting Is Centralized:
 *    - Eliminates ad-hoc date parsing and formatting across Mood History, Journal Entries,
 *      Chat History, Notifications, Achievements, and Dashboard cards.
 *    - Guarantees visual consistency across all feature surfaces.
 *
 * 2. Why Relative Labels Improve Readability:
 *    - Displaying "Today" or "Yesterday" for recent check-ins creates an immediate,
 *      human-centered context that reduces cognitive load in mental wellness logs.
 *
 * 3. Why `date-fns` Is Preferred:
 *    - Lightweight, modular, pure functions with immutable date handling and robust ISO-8601
 *      parsing. Avoids bulky Moment.js bundles and unsafe native regex slicing.
 *
 * 4. How Localization Can Be Introduced Later:
 *    - Locale objects (e.g., `date-fns/locale`) can be passed directly to `format()` inside
 *      these helper functions without editing any calling components.
 */

const FALLBACK_INVALID_DATE = 'Invalid date'

/**
 * Safely parse a Date instance, ISO-8601 string, or timestamp into a valid Date object.
 * Returns null if parsing fails or input is invalid.
 */
export function safeParseDate(input: Date | string | number | null | undefined): Date | null {
  if (!input) return null

  try {
    if (input instanceof Date) {
      return isValid(input) ? input : null
    }

    if (typeof input === 'number') {
      const date = new Date(input)
      return isValid(date) ? date : null
    }

    if (typeof input === 'string') {
      const trimmed = input.trim()
      if (!trimmed) return null

      /* Try ISO-8601 parsing first */
      const isoParsed = parseISO(trimmed)
      if (isValid(isoParsed)) return isoParsed

      /* Fallback to native Date parser */
      const nativeParsed = new Date(trimmed)
      if (isValid(nativeParsed)) return nativeParsed
    }
  } catch {
    // Suppress parse errors
  }

  return null
}

/**
 * Format a date as a short date string (e.g., "Jul 23, 2026").
 */
export function formatShortDate(dateInput: Date | string | number | null | undefined): string {
  const parsed = safeParseDate(dateInput)
  if (!parsed) return FALLBACK_INVALID_DATE

  try {
    return format(parsed, 'MMM dd, yyyy')
  } catch {
    return FALLBACK_INVALID_DATE
  }
}

/**
 * Format a date with human-readable relative labels ("Today", "Yesterday", or "Jul 23, 2026").
 */
export function formatRelativeDay(dateInput: Date | string | number | null | undefined): string {
  const parsed = safeParseDate(dateInput)
  if (!parsed) return FALLBACK_INVALID_DATE

  try {
    if (isToday(parsed)) return 'Today'
    if (isYesterday(parsed)) return 'Yesterday'
    return formatShortDate(parsed)
  } catch {
    return FALLBACK_INVALID_DATE
  }
}

/**
 * Format time of day (e.g., "7:15 PM").
 */
export function formatTime(dateInput: Date | string | number | null | undefined): string {
  const parsed = safeParseDate(dateInput)
  if (!parsed) return FALLBACK_INVALID_DATE

  try {
    return format(parsed, 'h:mm a')
  } catch {
    return FALLBACK_INVALID_DATE
  }
}

/**
 * Format date and time combined (e.g., "Jul 23, 2026 7:15 PM").
 */
export function formatDateTime(dateInput: Date | string | number | null | undefined): string {
  const parsed = safeParseDate(dateInput)
  if (!parsed) return FALLBACK_INVALID_DATE

  try {
    return format(parsed, 'MMM dd, yyyy h:mm a')
  } catch {
    return FALLBACK_INVALID_DATE
  }
}

/**
 * Format month and year (e.g., "July 2026").
 */
export function formatMonthYear(dateInput: Date | string | number | null | undefined): string {
  const parsed = safeParseDate(dateInput)
  if (!parsed) return FALLBACK_INVALID_DATE

  try {
    return format(parsed, 'MMMM yyyy')
  } catch {
    return FALLBACK_INVALID_DATE
  }
}

/**
 * Check if the given date is today.
 */
export function isTodayDate(dateInput: Date | string | number | null | undefined): boolean {
  const parsed = safeParseDate(dateInput)
  return parsed ? isToday(parsed) : false
}

/**
 * Check if the given date is yesterday.
 */
export function isYesterdayDate(dateInput: Date | string | number | null | undefined): boolean {
  const parsed = safeParseDate(dateInput)
  return parsed ? isYesterday(parsed) : false
}
