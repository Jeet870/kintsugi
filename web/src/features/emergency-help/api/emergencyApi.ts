import apiClient from '@/lib/api/apiClient'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { HelplineResource, CalmingTip } from '@/types/api'

/**
 * Retrieves country-specific emergency helpline resources via GET /emergency/helplines.
 * Defaults country code filter to 'IN' if unspecified.
 */
export async function getHelplines(countryCode: string = 'IN'): Promise<HelplineResource[]> {
  const response = await apiClient.get<HelplineResource[]>(ENDPOINTS.EMERGENCY.HELPLINES, {
    params: {
      country_code: countryCode.trim().toUpperCase(),
    },
  })
  return response.data
}

/**
 * Retrieves predefined calming guidance exercises and breathing techniques via GET /emergency/calming-tips.
 */
export async function getCalmingTips(): Promise<CalmingTip[]> {
  const response = await apiClient.get<CalmingTip[]>(ENDPOINTS.EMERGENCY.CALMING)
  return response.data
}

export const emergencyApi = {
  getHelplines,
  getCalmingTips,
}

export default emergencyApi
