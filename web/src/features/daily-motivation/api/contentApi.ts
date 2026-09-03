import apiClient from '@/lib/api/apiClient'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { ContentItem } from '@/types/api'

export interface GetTipsParams {
  category?: string
}

/* Fallback Curated Daily Motivation Content */
const FALLBACK_QUOTE: ContentItem = {
  id: 1,
  type: 'quote',
  text: 'The wound is the place where the Light enters you. — Rumi',
  category: 'hope',
}

const FALLBACK_AFFIRMATIONS: ContentItem[] = [
  {
    id: 101,
    type: 'affirmation',
    text: 'I am worthy of peace, rest, and unconditional self-compassion.',
    category: 'peace',
  },
  {
    id: 102,
    type: 'affirmation',
    text: 'I am growing and evolving every single day.',
    category: 'growth',
  },
  {
    id: 103,
    type: 'affirmation',
    text: 'My thoughts do not define me; I have the power to choose calm.',
    category: 'mindfulness',
  },
  {
    id: 104,
    type: 'affirmation',
    text: 'I honor my boundaries and make space for what restores my soul.',
    category: 'boundaries',
  },
]

const FALLBACK_TIPS: ContentItem[] = [
  {
    id: 201,
    type: 'tip',
    text: 'Take 5 deep diaphragmatic breaths — inhale peace for 4s, hold for 4s, and exhale stress for 6s.',
    category: 'breathing',
  },
  {
    id: 202,
    type: 'tip',
    text: 'Hydrate and stretch your shoulders away from your ears to release physical micro-tension.',
    category: 'physical',
  },
  {
    id: 203,
    type: 'tip',
    text: 'Step outside for 2 minutes and observe 3 grounding colors in your environment.',
    category: 'grounding',
  },
  {
    id: 204,
    type: 'tip',
    text: 'Write down one small win from today, no matter how modest it may seem.',
    category: 'gratitude',
  },
]

/**
 * Retrieves the rotating daily motivational quote via GET /content/quote.
 * Deterministically derived from the current day of the year unless random=true.
 */
export async function getDailyQuote(random = false): Promise<ContentItem> {
  try {
    const response = await apiClient.get<ContentItem>(ENDPOINTS.CONTENT.QUOTE, {
      params: random ? { random: true } : undefined,
    })
    if (response.data && response.data.text) {
      return response.data
    }
  } catch (err) {
    console.warn('Backend quote endpoint unavailable, using quotable fallback:', err)
  }
  return fetchQuotableQuote()
}

/**
 * Fetches a random quote directly from Quotable API (https://api.quotable.io/quotes/random).
 */
export async function fetchQuotableQuote(): Promise<ContentItem> {
  try {
    const res = await fetch('https://api.quotable.io/quotes/random')
    if (res.ok) {
      const data = await res.json()
      const quoteObj = Array.isArray(data) ? data[0] : data
      if (quoteObj && quoteObj.content) {
        return {
          id: Math.floor(Math.random() * 10000),
          type: 'quote',
          text: `${quoteObj.content} — ${quoteObj.author || 'Anonymous'}`,
          category: quoteObj.tags?.[0] || 'inspiration',
        }
      }
    }
  } catch {}
  return FALLBACK_QUOTE
}

/**
 * Retrieves active daily affirmations via GET /content?item_type=affirmation.
 */
export async function getAffirmations(): Promise<ContentItem[]> {
  try {
    const response = await apiClient.get<ContentItem[]>(ENDPOINTS.CONTENT.AFFIRMATIONS)
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data
    }
  } catch (err) {
    console.warn('Backend affirmations endpoint unavailable, using offline affirmations:', err)
  }
  return FALLBACK_AFFIRMATIONS
}

/**
 * Retrieves active self-care tips via GET /content/tips.
 */
export async function getSelfCareTips(params?: GetTipsParams): Promise<ContentItem[]> {
  try {
    const response = await apiClient.get<ContentItem[]>(ENDPOINTS.CONTENT.TIPS, {
      params: params?.category ? { category: params.category } : undefined,
    })
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data
    }
  } catch (err) {
    console.warn('Backend self-care tips endpoint unavailable, using offline tips:', err)
  }
  return FALLBACK_TIPS
}

export interface DailyMotivationResponse {
  id: number
  user_id: number
  content_date: string
  quote: ContentItem
  affirmations: ContentItem[]
  tips: ContentItem[]
}

/**
 * Retrieves or automatically generates today's motivation bundle via GET /content/daily.
 * Falls back seamlessly to offline quotes, affirmations, and self-care tips when network fails.
 */
export async function getDailyContent(dateStr?: string): Promise<DailyMotivationResponse> {
  try {
    const response = await apiClient.get<DailyMotivationResponse>(ENDPOINTS.CONTENT.DAILY, {
      params: dateStr ? { date_str: dateStr } : undefined,
    })
    if (response.data && (response.data.quote || response.data.affirmations?.length > 0)) {
      return response.data
    }
  } catch (err) {
    console.warn('Backend daily content endpoint unavailable, returning offline daily motivation bundle:', err)
  }

  const quote = await fetchQuotableQuote()
  return {
    id: 1,
    user_id: 1,
    content_date: dateStr || new Date().toISOString().split('T')[0],
    quote,
    affirmations: FALLBACK_AFFIRMATIONS,
    tips: FALLBACK_TIPS,
  }
}

export const contentApi = {
  getDailyContent,
  getDailyQuote,
  fetchQuotableQuote,
  getAffirmations,
  getSelfCareTips,
}

export default contentApi
