import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/queryKeys'
import { contentApi, type DailyMotivationResponse } from '../api/contentApi'
import type { ContentItem } from '@/types/api'
import type { APIError } from '@/lib/api/apiClient'

export interface DailyMotivationData {
  quote: ContentItem | null
  affirmations: ContentItem[]
  tips: ContentItem[]
}

/**
 * Production Automated Daily Content Hook.
 * Fetches or automatically creates today's user-specific motivation bundle from GET /content/daily.
 * Uses queryKey = queryKeys.content.daily(userId, YYYY-MM-DD) with 24 hours staleTime.
 */
export function useDailyContent(userId: string | number = 'me') {
  const queryClient = useQueryClient()

  /* Local YYYY-MM-DD date calculation */
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const todayDateStr = `${year}-${month}-${day}`

  const dailyQuery = useQuery<DailyMotivationResponse, APIError>({
    queryKey: queryKeys.content.daily(userId, todayDateStr),
    queryFn: () => contentApi.getDailyContent(todayDateStr),
    staleTime: 1000 * 60 * 60 * 1, // 1 hour stale time so date roll-overs fetch fresh content
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
    refetchOnWindowFocus: true,
  })

  const refetchAll = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.content.daily(userId, todayDateStr),
    })
    await dailyQuery.refetch()
  }

  const quoteData = dailyQuery.data?.quote ?? null
  const affirmationsData = dailyQuery.data?.affirmations ?? []
  const tipsData = dailyQuery.data?.tips ?? []

  return {
    dailyQuery,
    quoteQuery: {
      data: quoteData,
      isLoading: dailyQuery.isLoading,
      isFetching: dailyQuery.isFetching,
      isError: dailyQuery.isError,
      refetch: () => dailyQuery.refetch(),
    },
    affirmationsQuery: {
      data: affirmationsData,
      isLoading: dailyQuery.isLoading,
      isFetching: dailyQuery.isFetching,
      isError: dailyQuery.isError,
      refetch: () => dailyQuery.refetch(),
    },
    tipsQuery: {
      data: tipsData,
      isLoading: dailyQuery.isLoading,
      isFetching: dailyQuery.isFetching,
      isError: dailyQuery.isError,
      refetch: () => dailyQuery.refetch(),
    },
    data: {
      quote: quoteData,
      affirmations: affirmationsData,
      tips: tipsData,
    },
    isLoading: dailyQuery.isLoading,
    isFetching: dailyQuery.isFetching,
    isError: dailyQuery.isError,
    refetchAll,
  }
}

export default useDailyContent
