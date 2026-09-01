import { useQuery } from '@tanstack/react-query'
import { chatApi } from '../api/chatApi'
import type { ChatSession } from '@/types/api'
import type { APIError } from '@/lib/api/apiClient'

/**
 * Custom React Query hook for retrieving user session history.
 */
export function useUserSessions() {
  return useQuery<ChatSession[], APIError>({
    queryKey: ['chat', 'sessions', 'list'],
    queryFn: async (): Promise<ChatSession[]> => {
      return chatApi.getUserSessions(0, 50)
    },
    staleTime: 1000 * 60 * 2, // 2 minutes stale time
    gcTime: 1000 * 60 * 10,
  })
}

export default useUserSessions
