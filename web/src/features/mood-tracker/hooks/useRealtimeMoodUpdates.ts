import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socket } from '@/lib/realtime/socket'
import { queryKeys } from '@/lib/query/queryKeys'
import type { MoodEntry } from '@/types/api'

export interface RealtimeMoodUpdatePayload {
  entry_id?: string | number
  moodEntryId?: string | number
  id?: string | number
  ai_message?: string
  aiMessage?: string
  userId?: string
}

/**
 * Custom hook subscribing to `mood.entry_updated` WebSocket event.
 *
 * Surgically updates matching `ai_message` in TanStack Query cache without
 * refetching, invalidating queries, or triggering full page reloads.
 */
export function useRealtimeMoodUpdates(userId: string = 'me'): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    const handleMoodEntryUpdated = (data: unknown) => {
      if (!data || typeof data !== 'object') return

      const payload = data as RealtimeMoodUpdatePayload
      const targetId = payload.entry_id ?? payload.moodEntryId ?? payload.id
      const aiMessage = payload.ai_message ?? payload.aiMessage

      if (targetId === undefined || targetId === null || !aiMessage) return

      const targetUser = payload.userId || userId
      const historyKey = queryKeys.mood.history(targetUser)

      /* Surgically patch ai_message in user's mood history query cache */
      queryClient.setQueryData<MoodEntry[]>(historyKey, (oldEntries) => {
        if (!Array.isArray(oldEntries)) return oldEntries

        return oldEntries.map((entry) => {
          if (String(entry.id) === String(targetId)) {
            return {
              ...entry,
              ai_message: aiMessage,
            }
          }
          return entry
        })
      })

      /* Also patch any matching query starting with ['mood'] in cache */
      queryClient.setQueriesData<MoodEntry[]>({ queryKey: queryKeys.mood.all }, (oldEntries) => {
        if (!Array.isArray(oldEntries)) return oldEntries

        return oldEntries.map((entry) => {
          if (String(entry.id) === String(targetId)) {
            return {
              ...entry,
              ai_message: aiMessage,
            }
          }
          return entry
        })
      })
    }

    const unsubscribe = socket.subscribe('mood.entry_updated', handleMoodEntryUpdated)

    return () => {
      unsubscribe()
    }
  }, [queryClient, userId])
}

export default useRealtimeMoodUpdates
