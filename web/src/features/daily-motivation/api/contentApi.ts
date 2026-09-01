import apiClient from '@/lib/api/apiClient'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { ContentItem } from '@/types/api'

export interface GetTipsParams {
  category?: string
}

/**
 * Retrieves the rotating daily motivational quote via GET /content/quote.
 * Deterministically derived from the current day of the year unless random=true.
 */
export async function getDailyQuote(random = false): Promise<ContentItem> {
  try {
    const response = await apiClient.get<ContentItem>(ENDPOINTS.CONTENT.QUOTE, {
      params: random ? { random: true } : undefined,
    })
    return response.data
  } catch {
    return fetchQuotableQuote()
  }
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
  return {
    id: 1,
    type: 'quote',
    text: 'The wound is the place where the Light enters you. — Rumi',
    category: 'hope',
  }
}

/**
 * Retrieves active daily affirmations via GET /content?item_type=affirmation.
 */
export async function getAffirmations(): Promise<ContentItem[]> {
  const response = await apiClient.get<ContentItem[]>(ENDPOINTS.CONTENT.AFFIRMATIONS)
  return response.data
}

/**
 * Retrieves active self-care tips via GET /content/tips.
 */
export async function getSelfCareTips(params?: GetTipsParams): Promise<ContentItem[]> {
  const response = await apiClient.get<ContentItem[]>(ENDPOINTS.CONTENT.TIPS, {
    params: params?.category ? { category: params.category } : undefined,
  })
return response.data
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
 */
export async function getDailyContent(dateStr?: string): Promise<DailyMotivationResponse> {
  const response = await apiClient.get<DailyMotivationResponse>(ENDPOINTS.CONTENT.DAILY, {
    params: dateStr ? { date_str: dateStr } : undefined,
  })
  return response.data
}

export const contentApi = {
  getDailyContent,
  getDailyQuote,
  fetchQuotableQuote,
  getAffirmations,
  getSelfCareTips,
}

export default contentApi
