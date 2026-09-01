import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/queryKeys'
import { journalApi, type JournalListParams } from '../api/journalApi'
import type { JournalEntry } from '@/types/api'
import type { APIError } from '@/lib/api/apiClient'

export interface UseJournalEntriesOptions {
  userId?: string
  params?: JournalListParams
  enabled?: boolean
  staleTime?: number
  gcTime?: number
}

/**
 * Custom React Query hook for fetching and caching the authenticated user's journal entries.
 *
 * Provides query state, automatic request deduplication, loading/error states,
 * and keeps previous cached entries while refetching.
 */
export function useJournalEntries(options?: UseJournalEntriesOptions) {
  const userId = options?.userId ?? 'me'
  const params = options?.params

  return useQuery<JournalEntry[], APIError>({
    queryKey: [...queryKeys.journal.list(userId), params?.skip ?? 0, params?.limit ?? 100],
    queryFn: () => journalApi.list(params),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes default
    gcTime: options?.gcTime ?? 1000 * 60 * 15, // 15 minutes default
    placeholderData: (previousData) => previousData,
    retry: 2,
  })
}

export default useJournalEntries
