import apiClient from '@/lib/api/apiClient'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { User, UserUpdatePayload } from '@/types/api'

/**
 * Updates authenticated user profile details and settings preferences via PATCH /users/me.
 *
 * Single Source of Truth — reusable across all settings forms, preference toggles, and profile editors.
 */
export async function updateProfile(payload: UserUpdatePayload): Promise<User> {
  const response = await apiClient.patch<User>(ENDPOINTS.USERS.ME, payload)
  return response.data
}

export const settingsApi = {
  updateProfile,
}

export default settingsApi
