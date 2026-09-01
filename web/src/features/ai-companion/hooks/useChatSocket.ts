import { useEffect, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socket } from '@/lib/realtime/socket'
import { queryKeys } from '@/lib/query/queryKeys'
import type { ChatSession, ChatMessage, ChatSessionStatus } from '@/types/api'
import type { ChatMessageNewPayload, ChatEscalationPayload } from '@/lib/realtime/realtimeEvents'

export interface UseChatSocketReturn {
  isTyping: boolean
  setTyping: (typing: boolean) => void
}

/**
 * The 'latest' query key used when ChatWindow doesn't have a URL-based sessionId.
 * Must be kept in sync with useSendMessage.ts.
 */
const LATEST_SESSION_KEY = ['chat', 'session', 'latest'] as const

/**
 * Helper: Append a message to a ChatSession in React Query cache with deduplication.
 */
function appendMessageToSession(
  session: ChatSession | undefined,
  message: ChatMessage,
  statusOverride?: ChatSessionStatus,
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
    ...(statusOverride ? { status: statusOverride } : {}),
    messages: [...existingMessages, message],
  }
}

/**
 * Custom hook managing real-time WebSocket messaging for active chat sessions.
 *
 * Responsibilities:
 * 1. Subscribes to `chat.message_new` and `chat.escalation` events for the target session.
 * 2. Appends incoming AI and system messages into BOTH `queryKeys.chat.session(sessionId)`
 *    AND the 'latest' session key using `queryClient.setQueryData()`.
 * 3. Never invalidates queries, refetches sessions, or polls.
 * 4. Manages real-time typing indicator state based on backend response events.
 */
export function useChatSocket(sessionId?: string | number): UseChatSocketReturn {
  const queryClient = useQueryClient()
  const [isTyping, setIsTyping] = useState<boolean>(false)

  const setTyping = useCallback((typing: boolean) => {
    setIsTyping(typing)
  }, [])

  useEffect(() => {
    if (!sessionId) return

    const stringSessionId = String(sessionId)
    const sessionKey = queryKeys.chat.session(stringSessionId)

    /* 1. Handle incoming new AI message event */
    const handleNewMessage = (data: unknown) => {
      if (!data || typeof data !== 'object') return

      const payload = data as ChatMessageNewPayload & {
        session_id?: string | number
        sender?: string
        created_at?: string
        timestamp?: string
      }

      const incomingSessionId = String(payload.sessionId || payload.session_id || '')
      if (incomingSessionId && incomingSessionId !== stringSessionId) return

      const msg = payload.message as any
      const content = typeof msg === 'string' ? msg : msg?.content || payload.message?.content || ''
      if (!content) return

      const newChatMessage: ChatMessage = {
        id: msg?.id || `ai-msg-${Date.now()}`,
        session_id: stringSessionId,
        sender: (msg?.role === 'user' ? 'user' : 'ai') as any,
        content,
        created_at: msg?.createdAt || payload.created_at || payload.timestamp || new Date().toISOString(),
      }

      /* Append to BOTH cache keys for consistent UI */
      queryClient.setQueryData<ChatSession>(sessionKey, (old) =>
        appendMessageToSession(old, newChatMessage),
      )
      queryClient.setQueryData<ChatSession>(LATEST_SESSION_KEY, (old) =>
        appendMessageToSession(old, newChatMessage),
      )

      /* Clear typing indicator when reply arrives */
      setIsTyping(false)
    }

    /* 2. Handle emergency crisis escalation event */
    const handleEscalation = (data: unknown) => {
      if (!data || typeof data !== 'object') return

      const payload = data as ChatEscalationPayload & {
        session_id?: string | number
        escalation_message?: string
      }

      const incomingSessionId = String(payload.sessionId || payload.session_id || '')
      if (incomingSessionId && incomingSessionId !== stringSessionId) return

      const reason =
        payload.escalation?.reason ||
        payload.escalation_message ||
        'Emergency Crisis Escalation: Immediate helpline resources are available.'

      const escalationMessage: ChatMessage = {
        id: `escalation-${Date.now()}`,
        session_id: stringSessionId,
        sender: 'system',
        content: `[CRISIS ESCALATION] ${reason}`,
        created_at: new Date().toISOString(),
      }

      /* Append to BOTH cache keys */
      queryClient.setQueryData<ChatSession>(sessionKey, (old) =>
        appendMessageToSession(old, escalationMessage, 'escalated'),
      )
      queryClient.setQueryData<ChatSession>(LATEST_SESSION_KEY, (old) =>
        appendMessageToSession(old, escalationMessage, 'escalated'),
      )

      setIsTyping(false)
    }

    const unsubMessage = socket.subscribe('chat.message_new', handleNewMessage)
    const unsubEscalation = socket.subscribe('chat.escalation', handleEscalation)

    return () => {
      unsubMessage()
      unsubEscalation()
    }
  }, [queryClient, sessionId])

  return {
    isTyping,
    setTyping,
  }
}

export default useChatSocket
