/**
 * Discriminated union of all strongly-typed WebSocket realtime events in the application.
 */

export interface MoodEntryUpdatedPayload {
  moodEntryId?: string | number
  entry_id?: string | number
  id?: string | number
  userId?: string
  aiMessage?: string
  ai_message?: string
  note?: string
  mood_type?: string
}

export interface ChatMessageNewPayload {
  sessionId: string
  message: {
    id?: string
    role: string
    content: string
    createdAt?: string
  }
}

export interface ChatEscalationPayload {
  sessionId: string
  escalation: {
    level: string
    reason: string
    helplines?: unknown[]
  }
}

export interface StreakUpdatedPayload {
  currentStreak: number
  longestStreak: number
  userId?: string
}

export interface AchievementEarnedPayload {
  achievement: {
    id: string
    title: string
    description?: string
    icon?: string
    earnedAt?: string
  }
}

export interface NotificationNewPayload {
  notification: {
    id: string
    title: string
    message: string
    read?: boolean
    createdAt?: string
  }
}

export type RealtimeEventMap = {
  'mood.entry_updated': MoodEntryUpdatedPayload
  'chat.message_new': ChatMessageNewPayload
  'chat.escalation': ChatEscalationPayload
  'streak.updated': StreakUpdatedPayload
  'achievement.earned': AchievementEarnedPayload
  'notification.new': NotificationNewPayload
}

export type RealtimeEventType = keyof RealtimeEventMap

export type RealtimeEventPacket<T extends RealtimeEventType = RealtimeEventType> = {
  type: T
  payload: RealtimeEventMap[T]
}
