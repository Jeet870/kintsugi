import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/queryKeys'
import { useRealtimeChannel } from '@/lib/realtime/useRealtimeChannel'
import type { StreakUpdatedPayload, AchievementEarnedPayload } from '@/lib/realtime/realtimeEvents'

export interface UseRealtimeStreakUpdatesOptions {
  onAchievementEarned?: (payload: AchievementEarnedPayload) => void
  onStreakUpdated?: (payload: StreakUpdatedPayload) => void
}

/**
 * Real-time WebSocket Synchronization Hook for Streaks and Achievements.
 *
 * Subscribes to `streak.updated` and `achievement.earned` events over the single shared WebSocket channel.
 * Automatically invalidates relevant React Query caches to trigger seamless UI updates without polling.
 */
export function useRealtimeStreakUpdates(_options?: UseRealtimeStreakUpdatesOptions) {
  const queryClient = useQueryClient()

  /* 1. Subscribe to streak.updated channel event */
  useRealtimeChannel('streak.updated')

  /* 2. Subscribe to achievement.earned channel event */
  useRealtimeChannel('achievement.earned')

  return {
    invalidateProfile: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all })
    },
  }
}

export default useRealtimeStreakUpdates
