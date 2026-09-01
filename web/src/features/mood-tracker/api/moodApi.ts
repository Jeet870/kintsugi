import apiClient from '@/lib/api/apiClient'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { MoodEntry, MoodType } from '@/types/api'

export interface LogMoodPayload {
  mood_type: MoodType | string
  note?: string | null
  entry_date?: string
}

export interface MoodHistoryParams {
  skip?: number
  limit?: number
}

/**
 * Persists a daily mood check-in entry to the FastAPI backend via POST /mood.
 * Returns the recorded mood entry. Initially, `ai_message` will be null while
 * background Celery workers generate the supportive message.
 */
export async function logMood(payload: LogMoodPayload): Promise<MoodEntry> {
  const response = await apiClient.post<MoodEntry>(ENDPOINTS.MOOD.CREATE, payload)
  return response.data
}

/**
 * Retrieves paginated historical mood check-in entries from FastAPI backend via GET /mood/history.
 * Preserves backend ordering and data structure.
 */
export async function getMoodHistory(params?: MoodHistoryParams): Promise<MoodEntry[]> {
  const response = await apiClient.get<MoodEntry[]>(ENDPOINTS.MOOD.HISTORY, {
    params: {
      skip: params?.skip ?? 0,
      limit: params?.limit ?? 100,
    },
  })
  return response.data
}

export const moodApi = {
  logMood,
  getMoodHistory,
}

export default moodApi
