import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/queryKeys'
import { moodApi, type MoodHistoryParams } from '../api/moodApi'
import type { MoodEntry } from '@/types/api'
import type { APIError } from '@/lib/api/apiClient'

export interface UseMoodHistoryOptions {
  userId?: string
  params?: MoodHistoryParams
  enabled?: boolean
  staleTime?: number
  gcTime?: number
}

/**
 * Custom React Query hook for fetching paginated user mood history.
 *
 * Generic hook providing query state, loading, error, and refetch handlers.
 */
export function useMoodHistory(options?: UseMoodHistoryOptions) {
  const userId = options?.userId ?? 'me'
  const params = options?.params

  return useQuery<MoodEntry[], APIError>({
    queryKey: [...queryKeys.mood.history(userId), params?.skip ?? 0, params?.limit ?? 100],
    queryFn: () => moodApi.getMoodHistory(params),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 1000 * 30, // 30 seconds stale time
    gcTime: options?.gcTime ?? 1000 * 60 * 15, // 15 minutes garbage collection time
    refetchInterval: (query) => {
      const entries = query.state.data
      if (Array.isArray(entries) && entries.some((e) => !e.ai_message)) {
        return 1500 // Automatically poll every 1.5s until AI message arrives
      }
      return false // Stop polling once AI message is populated
    },
    retry: 2,
  })
}

export default useMoodHistory
