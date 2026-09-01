import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/queryKeys'
import { moodApi, type LogMoodPayload } from '../api/moodApi'
import type { MoodEntry, MoodType } from '@/types/api'
import type { APIError } from '@/lib/api/apiClient'

export interface UseLogMoodOptions {
  userId?: string
  onSuccess?: (data: MoodEntry) => void
  onError?: (error: APIError) => void
}

interface MutationContext {
  previousHistory?: MoodEntry[]
  optimisticId: string | number
}

/**
 * Custom React Query mutation hook for submitting mood entries.
 *
 * Implements optimistic updates:
 * 1. Immediately inserts a pending mood entry with `ai_message: null` into cache.
 * 2. Rollback correctly if mutation fails.
 * 3. Replaces optimistic entry with canonical backend data on success.
 */
export function useLogMood(options?: UseLogMoodOptions) {
  const queryClient = useQueryClient()
  const userId = options?.userId ?? 'me'
  const historyKey = queryKeys.mood.history(userId)

  return useMutation<MoodEntry, APIError, LogMoodPayload, MutationContext>({
    mutationFn: (payload: LogMoodPayload) => moodApi.logMood(payload),

    onMutate: async (newMood: LogMoodPayload): Promise<MutationContext> => {
      /* 1. Cancel outgoing history queries so optimistic update is not overwritten */
      await queryClient.cancelQueries({ queryKey: historyKey })

      /* 2. Snapshot current query cache */
      const previousHistory = queryClient.getQueryData<MoodEntry[]>(historyKey)

      /* 3. Minimum required optimistic entry with ai_message: null */
      const optimisticId = `optimistic-${Date.now()}`
      const optimisticEntry: MoodEntry = {
        id: optimisticId,
        user_id: userId,
        mood_type: newMood.mood_type as MoodType,
        note: newMood.note ?? null,
        ai_message: null,
        entry_date: newMood.entry_date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      }

      /* 4. Optimistically insert new entry at head of list */
      queryClient.setQueryData<MoodEntry[]>(historyKey, (old) => {
        const currentList = Array.isArray(old) ? old : []
        return [optimisticEntry, ...currentList]
      })

      return { previousHistory, optimisticId }
    },

    onError: (err, _variables, context) => {
      /* Rollback to original cache state on network or server error */
      if (context?.previousHistory) {
        queryClient.setQueryData(historyKey, context.previousHistory)
      }
      options?.onError?.(err)
    },

    onSuccess: (data, _variables, context) => {
      /* Replace optimistic entry with backend response */
      queryClient.setQueryData<MoodEntry[]>(historyKey, (old) => {
        if (!Array.isArray(old)) return [data]
        return old.map((entry) => (entry.id === context?.optimisticId ? data : entry))
      })

      /* Schedule refetch after 2.5s to silently fetch background-generated AI message */
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: historyKey })
      }, 2500)

      options?.onSuccess?.(data)
    },
  })
}

export default useLogMood
