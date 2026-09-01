import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/queryKeys'
import { chatApi } from '../api/chatApi'
import type { ChatSession } from '@/types/api'
import type { APIError } from '@/lib/api/apiClient'

export interface UseChatSessionOptions {
  sessionId?: string
  enabled?: boolean
}

/**
 * The 'latest' query key used when no URL sessionId is provided.
 * Must stay in sync with useSendMessage.ts and useChatSocket.ts.
 */
const LATEST_SESSION_KEY = ['chat', 'session', 'latest'] as const

/**
 * Custom React Query hook for loading or initializing the active AI Companion chat session.
 *
 * Behavior:
 * 1. If a specific `sessionId` is provided, fetches metadata & message history for that session.
 * 2. If no `sessionId` is provided, fetches the user's active session list.
 * 3. Automatically creates a new session via `chatApi.startSession()` if no session exists yet.
 * 4. CRITICAL: Always cross-populates both `['chat', 'session', '<id>']` and
 *    `['chat', 'session', 'latest']` cache keys so that optimistic updates
 *    and WebSocket events (which target the ID-specific key) are visible
 *    in the UI even when the component is watching the 'latest' key.
 */
export function useChatSession(options?: UseChatSessionOptions) {
  const queryClient = useQueryClient()
  const requestedId = options?.sessionId

  return useQuery<ChatSession, APIError>({
    queryKey: requestedId
      ? queryKeys.chat.session(requestedId)
      : LATEST_SESSION_KEY,
    queryFn: async (): Promise<ChatSession> => {
      /* 1. Direct fetch if explicit sessionId provided */
      if (requestedId && requestedId !== 'latest') {
        const session = await chatApi.getSession(requestedId)
        // Cross-populate the 'latest' key so both keys stay in sync
        queryClient.setQueryData(LATEST_SESSION_KEY, session)
        return session
      }

      /* 2. Look up existing active user sessions */
      const userSessions = await chatApi.getUserSessions(0, 10)
      const activeSession = userSessions.find((s) => s.status === 'active') || userSessions[0]

      if (activeSession) {
        const fullSession = await chatApi.getSession(String(activeSession.id))
        // Cross-populate BOTH cache keys
        queryClient.setQueryData(
          queryKeys.chat.session(String(activeSession.id)),
          fullSession,
        )
        return fullSession
      }

      /* 3. Auto-create session if none exist */
      const newSession = await chatApi.startSession()
      queryClient.setQueryData(
        queryKeys.chat.session(String(newSession.id)),
        newSession,
      )
      return newSession
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
    gcTime: 1000 * 60 * 15, // 15 minutes garbage collection time
    retry: 2,
  })
}

export default useChatSession
