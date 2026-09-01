import apiClient from '@/lib/api/apiClient'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { ChatSession, ChatMessage } from '@/types/api'

export interface PostMessagePayload {
  message: string
}

/**
 * Creates a new active AI companion chat session on the FastAPI backend via POST /chat/sessions.
 */
export async function startSession(): Promise<ChatSession> {
  const response = await apiClient.post<ChatSession>(ENDPOINTS.CHAT.CREATE_SESSION)
  return response.data
}

/**
 * Retrieves metadata, session status, and message history for a given session via GET /chat/sessions/{sessionId}.
 */
export async function getSession(sessionId: string): Promise<ChatSession> {
  const response = await apiClient.get<ChatSession>(ENDPOINTS.CHAT.SESSION_DETAIL(sessionId))
  return response.data
}

/**
 * Retrieves all chat sessions owned by the authenticated user via GET /chat/sessions.
 */
export async function getUserSessions(skip: number = 0, limit: number = 50): Promise<ChatSession[]> {
  const response = await apiClient.get<ChatSession[]>(ENDPOINTS.CHAT.CREATE_SESSION, {
    params: { skip, limit },
  })
  return response.data
}

/**
 * Posts a user message to an active chat session via POST /chat/sessions/{sessionId}/messages.
 * The API acknowledges receipt. The AI response is delivered asynchronously via WebSocket.
 */
export async function postMessage(sessionId: string, text: string): Promise<ChatMessage> {
  const response = await apiClient.post<ChatMessage>(
    ENDPOINTS.CHAT.SEND_MESSAGE(sessionId),
    { message: text },
  )
  return response.data
}

export const chatApi = {
  startSession,
  getSession,
  getUserSessions,
  postMessage,
}

export default chatApi
