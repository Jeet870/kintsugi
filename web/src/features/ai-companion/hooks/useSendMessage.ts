import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/queryKeys'
import { chatApi } from '../api/chatApi'
import type { ChatSession, ChatMessage } from '@/types/api'
import type { APIError } from '@/lib/api/apiClient'

export interface SendMessageVariables {
  sessionId: string | number
  text: string
}

interface MutationContext {
  previousSession?: ChatSession
  previousLatest?: ChatSession
  optimisticId: string
  sessionKey: readonly string[]
}

export interface UseSendMessageOptions {
  onSuccess?: (data: ChatMessage) => void
  onError?: (error: APIError) => void
}

/**
 * The 'latest' query key used when ChatWindow doesn't have a URL-based sessionId.
 * useChatSession falls back to this key, so we must update it for optimistic UI.
 */
const LATEST_SESSION_KEY = ['chat', 'session', 'latest'] as const

/**
 * Helper: Append a message to a ChatSession in the React Query cache,
 * with deduplication by message ID.
 */
function appendMessageToSession(
  session: ChatSession | undefined,
  message: ChatMessage,
): ChatSession | undefined {
  if (!session) return session

  const existingMessages = Array.isArray(session.messages)
    ? [...session.messages]
    : []

  const isDuplicate = existingMessages.some(
    (m) => String(m.id) === String(message.id),
  )
  if (isDuplicate) return session

  return {
    ...session,
    messages: [...existingMessages, message],
  }
}

/**
 * Custom React Query mutation hook for sending user chat messages.
 *
 * Implements optimistic updates & instant response hydration:
 * 1. Immediately appends user message to BOTH session-specific and 'latest' cache keys.
 * 2. Posts message to backend via chatApi.postMessage().
 * 3. On success, replaces the optimistic user message with real data and appends AI reply.
 * 4. Rollback cache state if HTTP request fails.
 * 5. Deduplicates with WebSocket events using unique message IDs.
 */
export function useSendMessage(options?: UseSendMessageOptions) {
  const queryClient = useQueryClient()

  return useMutation<ChatMessage, APIError, SendMessageVariables, MutationContext>({
    mutationFn: ({ sessionId, text }: SendMessageVariables) =>
      chatApi.postMessage(String(sessionId), text),

    onMutate: async ({ sessionId, text }): Promise<MutationContext> => {
      const sessionKey = queryKeys.chat.session(String(sessionId))

      /* 1. Cancel outgoing queries to prevent cache collision */
      await queryClient.cancelQueries({ queryKey: sessionKey })
      await queryClient.cancelQueries({ queryKey: LATEST_SESSION_KEY })

      /* 2. Snapshot current cache for rollback */
      const previousSession = queryClient.getQueryData<ChatSession>(sessionKey)
      const previousLatest = queryClient.getQueryData<ChatSession>(LATEST_SESSION_KEY)

      /* 3. Create optimistic user message */
      const optimisticId = `optimistic-${Date.now()}`
      const optimisticMessage: ChatMessage = {
        id: optimisticId,
        session_id: sessionId,
        sender: 'user',
        content: text,
        created_at: new Date().toISOString(),
      }

      /* 4. Optimistically append to BOTH cache keys */
      queryClient.setQueryData<ChatSession>(sessionKey, (old) =>
        appendMessageToSession(old, optimisticMessage),
      )
      queryClient.setQueryData<ChatSession>(LATEST_SESSION_KEY, (old) =>
        appendMessageToSession(old, optimisticMessage),
      )

      return { previousSession, previousLatest, optimisticId, sessionKey }
    },

    onError: (_err, variables, context) => {
      /* Rollback both cache keys on error */
      if (context) {
        const sessionKey = queryKeys.chat.session(String(variables.sessionId))
        if (context.previousSession !== undefined) {
          queryClient.setQueryData(sessionKey, context.previousSession)
        }
        if (context.previousLatest !== undefined) {
          queryClient.setQueryData(LATEST_SESSION_KEY, context.previousLatest)
        }
      }
      options?.onError?.(_err)
    },

    onSuccess: (data, variables, context) => {
      const sessionKey = queryKeys.chat.session(String(variables.sessionId))

      /**
       * Replace the optimistic user message with real data and append AI reply.
       * We update both cache keys to ensure UI re-renders regardless of which key
       * useChatSession is watching.
       */
      const updateSession = (oldSession: ChatSession | undefined): ChatSession | undefined => {
        if (!oldSession) return oldSession

        const existingMessages = Array.isArray(oldSession.messages)
          ? [...oldSession.messages]
          : []

        // Replace optimistic message with real user message ID if possible
        const updatedMessages = existingMessages.map((m) => {
          if (String(m.id) === context?.optimisticId) {
            return {
              ...m,
              id: data.id ? `user-${data.id}` : m.id,
            }
          }
          return m
        })

        // Append AI reply if present
        if (data) {
          const replyContent = (data as any).reply || data.content
          if (replyContent) {
            const aiMessage: ChatMessage = {
              id: data.id || `ai-${Date.now()}`,
              session_id: String(variables.sessionId),
              sender: 'ai',
              content: replyContent,
              created_at: data.created_at || new Date().toISOString(),
            }

            const isDuplicate = updatedMessages.some(
              (m) => String(m.id) === String(aiMessage.id),
            )
            if (!isDuplicate) {
              updatedMessages.push(aiMessage)
            }
          }
        }

        return {
          ...oldSession,
          status: (data as any)?.flagged_crisis ? 'escalated' : oldSession.status,
          messages: updatedMessages,
        }
      }

      queryClient.setQueryData<ChatSession>(sessionKey, updateSession)
      queryClient.setQueryData<ChatSession>(LATEST_SESSION_KEY, updateSession)

      options?.onSuccess?.(data)
    },
  })
}

export default useSendMessage
