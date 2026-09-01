import { useEffect } from 'react'
import { socket } from '@/lib/realtime/socket'
import { queryClient } from '@/lib/query/queryClient'
import { queryKeys } from '@/lib/query/queryKeys'
import type { MoodEntry } from '@/types/api'
import type {
  RealtimeEventType,
  MoodEntryUpdatedPayload,
  ChatMessageNewPayload,
  ChatEscalationPayload,
  StreakUpdatedPayload,
  AchievementEarnedPayload,
  NotificationNewPayload,
} from '@/lib/realtime/realtimeEvents'

/**
 * useRealtimeChannel — Centralized TanStack Query & WebSocket Synchronization Hook.
 *
 * Automatically subscribes to incoming server events, intelligently updating
 * the TanStack Query cache without requiring manual page refreshes.
 */
export function useRealtimeChannel<T extends RealtimeEventType>(eventType: T): void {
  useEffect(() => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[Realtime] Subscribed to channel: ${eventType}`)
    }

    const unsubscribe = socket.subscribe(eventType, (data: unknown) => {
      if (!data || typeof data !== 'object') {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error(`[Realtime] Ignored malformed payload for event "${eventType}":`, data)
        }
        return
      }

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(`[Realtime] Received event "${eventType}":`, data)
      }

      switch (eventType) {
        case 'mood.entry_updated': {
          const payload = data as MoodEntryUpdatedPayload
          const targetUser = payload.userId || 'me'
          const targetId = payload.moodEntryId || (payload as any).entry_id || (payload as any).id
          const aiMessage = payload.aiMessage || payload.ai_message

          if (targetId && aiMessage) {
            /* Surgically patch matching mood entry's ai_message without refetching or invalidating queries */
            queryClient.setQueryData<MoodEntry[]>(
              queryKeys.mood.history(targetUser),
              (oldEntries) => {
                if (!Array.isArray(oldEntries)) return oldEntries
                return oldEntries.map((entry) =>
                  String(entry.id) === String(targetId)
                    ? { ...entry, ai_message: aiMessage }
                    : entry,
                )
              },
            )
          }

          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log(`[Realtime] Patched ai_message for mood entry ${targetId}`)
          }
          break
        }

        case 'chat.message_new': {
          const payload = data as ChatMessageNewPayload
          if (!payload.sessionId || !payload.message) break

          /* Direct cache patch for zero-latency messaging */
          queryClient.setQueryData(
            queryKeys.chat.messages(payload.sessionId),
            (oldMessages: unknown) => {
              const list = Array.isArray(oldMessages) ? oldMessages : []
              return [...list, payload.message]
            },
          )

          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log(`[Realtime] Appended new chat message to session ${payload.sessionId}`)
          }
          break
        }

        case 'chat.escalation': {
          const payload = data as ChatEscalationPayload
          if (!payload.sessionId) break

          /* Direct session metadata patch */
          queryClient.setQueryData(
            queryKeys.chat.session(payload.sessionId),
            (oldSession: any) => {
              if (!oldSession) return { id: payload.sessionId, escalation: payload.escalation }
              return { ...oldSession, escalation: payload.escalation }
            },
          )

          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log(`[Realtime] Patched escalation state for session ${payload.sessionId}`)
          }
          break
        }

        case 'streak.updated': {
          const payload = data as StreakUpdatedPayload
          const targetUser = payload.userId || 'me'

          /* Invalidate user profile, achievements, and mood streak */
          queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(targetUser) })
          queryClient.invalidateQueries({ queryKey: queryKeys.achievements.user(targetUser) })
          queryClient.invalidateQueries({ queryKey: queryKeys.mood.streak(targetUser) })

          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log(`[Realtime] Invalidated streak & profile queries for user ${targetUser}`)
          }
          break
        }

        case 'achievement.earned': {
          const payload = data as AchievementEarnedPayload
          if (!payload.achievement) break

          /* Immediate cache addition for responsive UI feedback */
          queryClient.setQueryData(
            queryKeys.achievements.user('me'),
            (oldBadges: unknown) => {
              const list = Array.isArray(oldBadges) ? oldBadges : []
              return [payload.achievement, ...list]
            },
          )

          /* Refresh catalog progress */
          queryClient.invalidateQueries({ queryKey: queryKeys.achievements.catalog })

          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log(`[Realtime] Appended earned achievement: ${payload.achievement.title}`)
          }
          break
        }

        case 'notification.new': {
          const payload = data as NotificationNewPayload
          if (!payload.notification) break

          /* Prepend new notification to list */
          queryClient.setQueryData(
            queryKeys.notifications.list('me'),
            (oldNotifs: unknown) => {
              const list = Array.isArray(oldNotifs) ? oldNotifs : []
              return [payload.notification, ...list]
            },
          )

          /* Increment unread badge counter */
          queryClient.setQueryData(
            queryKeys.notifications.unread,
            (oldUnread: unknown) => (typeof oldUnread === 'number' ? oldUnread + 1 : 1),
          )

          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log(`[Realtime] Prepended notification: ${payload.notification.title}`)
          }
          break
        }

        default:
          break
      }
    })

    return () => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(`[Realtime] Unsubscribed from channel: ${eventType}`)
      }
      unsubscribe()
    }
  }, [eventType])
}

export default useRealtimeChannel
