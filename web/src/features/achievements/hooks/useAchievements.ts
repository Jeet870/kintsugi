import { useQuery } from '@tanstack/react-query'
import { achievementApi } from '../api/achievementApi'
import type { APIError } from '@/lib/api/apiClient'
import type {
  Achievement,
  UserAchievementsAndStreakResponse,
} from '@/types/api'

/**
 * React Query hook to fetch the full achievement catalog.
 */
export function useAchievementCatalog() {
  return useQuery<Achievement[], APIError>({
    queryKey: ['achievements', 'catalog'],
    queryFn: achievementApi.getAchievementCatalog,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * React Query hook to fetch the authenticated user's earned badges and streak stats.
 */
export function useUserAchievements() {
  return useQuery<UserAchievementsAndStreakResponse, APIError>({
    queryKey: ['achievements', 'user'],
    queryFn: achievementApi.getUserAchievements,
    staleTime: 30 * 1000,
  })
}
