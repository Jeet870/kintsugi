import apiClient from '@/lib/api/apiClient'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type {
  Achievement,
  UserAchievementsAndStreakResponse,
} from '@/types/api'

/**
 * Retrieves the complete master achievement catalog from GET /achievements.
 */
export async function getAchievementCatalog(): Promise<Achievement[]> {
  const response = await apiClient.get<Achievement[]>(ENDPOINTS.ACHIEVEMENTS.CATALOG)
  return response.data
}

/**
 * Retrieves the authenticated user's earned badges and streak stats from GET /achievements/me.
 */
export async function getUserAchievements(): Promise<UserAchievementsAndStreakResponse> {
  const response = await apiClient.get<UserAchievementsAndStreakResponse>(ENDPOINTS.ACHIEVEMENTS.ME)
  return response.data
}

export const achievementApi = {
  getAchievementCatalog,
  getUserAchievements,
}

export default achievementApi
