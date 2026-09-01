import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/queryKeys'
import { journalApi } from '../api/journalApi'
import type { APIError } from '@/lib/api/apiClient'

export interface UseDeleteJournalEntryOptions {
  userId?: string
  onSuccess?: () => void
  onError?: (error: APIError) => void
}

export function useDeleteJournalEntry(options?: UseDeleteJournalEntryOptions) {
  const queryClient = useQueryClient()
  const userId = options?.userId ?? 'me'

  return useMutation<void, APIError, string | number>({
    mutationFn: (entryId) => journalApi.remove(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.list(userId) })
      options?.onSuccess?.()
    },
    onError: (error) => {
      options?.onError?.(error)
    },
  })
}

export default useDeleteJournalEntry
