import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/queryKeys'
import { profileApi } from '../api/profileApi'
import type { User, UserStreakInfo, UserAchievementsAndStreakResponse } from '@/types/api'
import type { APIError } from '@/lib/api/apiClient'

export interface ProfileData {
  user: User
  streak: UserStreakInfo
  achievements: UserAchievementsAndStreakResponse
}

export interface UseProfileOptions {
  enabled?: boolean
  staleTime?: number
  gcTime?: number
}

/**
 * Custom React Query hook for retrieving and caching authenticated user profile, streak, and achievements.
 *
 * Single Source of Truth: Binds to `queryKeys.profile.me()`.
 */
export function useProfile(options?: UseProfileOptions) {
  return useQuery<ProfileData, APIError>({
    queryKey: queryKeys.profile.me(),

    queryFn: async (): Promise<ProfileData> => {
      const [user, achievementsData] = await Promise.all([
        profileApi.getProfile(),
        profileApi.getAchievements(),
      ])

      const streak: UserStreakInfo = {
        current_streak: achievementsData.current_streak,
        longest_streak: achievementsData.longest_streak,
        last_logged_date: achievementsData.last_logged_date,
      }

      return {
        user,
        streak,
        achievements: achievementsData,
      }
    },

    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes default
    gcTime: options?.gcTime ?? 1000 * 60 * 15, // 15 minutes default
    placeholderData: (previousData) => previousData,
    retry: 2,
  })
}

export default useProfile
