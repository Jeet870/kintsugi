import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/queryKeys'
import { journalApi } from '../api/journalApi'
import type { JournalEntry } from '@/types/api'
import type { APIError } from '@/lib/api/apiClient'

export interface SaveJournalEntryVariables {
  id?: string | number
  title: string
  content: string
}

export interface UseSaveJournalEntryOptions {
  userId?: string
  onSuccess?: (data: JournalEntry) => void
  onError?: (error: APIError) => void
}

/**
 * Custom React Query mutation hook for creating or updating journal entries.
 *
 * Behavior:
 * 1. Automatically detects whether the operation is a `create` (no ID) or `update` (existing ID).
 * 2. Executes the appropriate backend REST call via `journalApi`.
 * 3. Invalidates `queryKeys.journal.all` on success so the list query refreshes automatically.
 */
export function useSaveJournalEntry(options?: UseSaveJournalEntryOptions) {
  const queryClient = useQueryClient()
  const userId = options?.userId ?? 'me'

  return useMutation<JournalEntry, APIError, SaveJournalEntryVariables>({
    mutationFn: ({ id, title, content }: SaveJournalEntryVariables) => {
      if (id !== undefined && id !== null && id !== '') {
        return journalApi.update(id, { title, content })
      }
      return journalApi.create({ title, content })
    },

    onSuccess: (data) => {
      /* Invalidate all journal queries so the list automatically reflects the new/updated entry */
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.list(userId) })
      options?.onSuccess?.(data)
    },

    onError: (err) => {
      options?.onError?.(err)
    },
  })
}

export interface UseDeleteJournalEntryOptions {
  userId?: string
  onSuccess?: () => void
  onError?: (error: APIError) => void
}

/**
 * Custom React Query mutation hook for deleting a journal entry.
 *
 * Automatically invalidates `queryKeys.journal.all` upon successful deletion.
 */
export function useDeleteJournalEntry(options?: UseDeleteJournalEntryOptions) {
  const queryClient = useQueryClient()
  const userId = options?.userId ?? 'me'

  return useMutation<void, APIError, string | number>({
    mutationFn: (id: string | number) => journalApi.remove(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.list(userId) })
      options?.onSuccess?.()
    },

    onError: (err) => {
      options?.onError?.(err)
    },
  })
}

export default useSaveJournalEntry
