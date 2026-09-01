import apiClient from '@/lib/api/apiClient'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { User, UserStreakInfo, UserAchievementsAndStreakResponse } from '@/types/api'

/**
 * Retrieves the current authenticated user profile representation via GET /users/me.
 */
export async function getProfile(): Promise<User> {
  const response = await apiClient.get<User>(ENDPOINTS.PROFILE.ME)
  return response.data
}

/**
 * Retrieves active user streak statistics (current streak, longest streak, last logged date).
 */
export async function getStreak(): Promise<UserStreakInfo> {
  const response = await apiClient.get<UserAchievementsAndStreakResponse>(
    ENDPOINTS.PROFILE.STREAK,
  )
  return {
    current_streak: response.data.current_streak,
    longest_streak: response.data.longest_streak,
    last_logged_date: response.data.last_logged_date,
  }
}

/**
 * Retrieves unlocked achievements, badges, and streak statistics via GET /achievements/me.
 */
export async function getAchievements(): Promise<UserAchievementsAndStreakResponse> {
  const response = await apiClient.get<UserAchievementsAndStreakResponse>(
    ENDPOINTS.PROFILE.ACHIEVEMENTS,
  )
  return response.data
}

export const profileApi = {
  getProfile,
  getStreak,
  getAchievements,
}

export default profileApi
