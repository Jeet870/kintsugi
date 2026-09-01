import { useDailyContent as useSharedDailyContent } from '@/features/daily-motivation/hooks/useDailyContent'
import type { ContentItem } from '@/types/api'

export type DailyQuoteItem = ContentItem

export function useDailyContent() {
  const query = useSharedDailyContent()

  return {
    quote: query.data?.quote,
    affirmations: query.data?.affirmations,
    tips: query.data?.tips,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.dailyQuery.error,
    refetch: query.refetchAll,
  }
}

export default useDailyContent
