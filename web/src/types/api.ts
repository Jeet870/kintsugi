/**
 * Centralized TypeScript API Contract Library.
 * Mirrors FastAPI backend Pydantic response models and SQLAlchemy schema definitions.
 *
 * Single Source of Truth — do not redefine backend model types in local feature files.
 */

/* ─── Domain Enums & Discriminated Union Literals ─── */

export type MoodType = 'happy' | 'calm' | 'sad' | 'angry' | 'anxious' | 'tired'

export type ChatSender = 'user' | 'ai' | 'system'

export type ChatSessionStatus = 'active' | 'closed' | 'escalated'

export type ContentType = 'quote' | 'affirmation' | 'tip'

export type UserRole = 'user' | 'admin' | 'counselor'

export type CrisisSeverity = 'none' | 'low' | 'medium' | 'high' | 'critical'

export type AchievementCode =
  | 'first_mood_logged'
  | 'first_journal_entry'
  | '7_day_streak'
  | '30_day_streak'
  | 'companion_chatter'
  | 'wellness_seeker'
  | string

/* ─── Authentication & User Models ─── */

export interface UserCreatePayload {
  readonly name: string
  readonly email: string
  readonly password: string
}

export interface UserLoginPayload {
  readonly email: string
  readonly password: string
}

export interface UserUpdatePayload {
  readonly name?: string
  readonly avatar_url?: string | null
  readonly theme_preference?: string
  readonly notification_enabled?: boolean
  readonly timezone?: string
  readonly language?: string
}

export interface User {
  readonly id: number | string
  readonly uuid?: string
  readonly email: string
  readonly name?: string | null
  readonly avatar_url?: string | null
  readonly role?: UserRole
  readonly is_active?: boolean
  readonly created_at: string
  readonly theme_preference?: string
  readonly notification_enabled?: boolean
}

export interface TokenPair {
  readonly access_token: string
  readonly refresh_token?: string | null
  readonly token_type: string
  readonly expires_in?: number
}

/* ─── Mood Models ─── */

export interface MoodEntry {
  readonly id: number | string
  readonly user_id: number | string
  readonly mood_type: MoodType
  readonly note?: string | null
  readonly ai_message?: string | null
  readonly entry_date: string
  readonly created_at: string
}

export type MoodHistoryResponse = readonly MoodEntry[]

/* ─── Journal Models ─── */

export interface JournalEntry {
  readonly id: number | string
  readonly user_id: number | string
  readonly title: string
  readonly content: string
  readonly created_at: string
  readonly updated_at?: string | null
}

export type JournalEntryListResponse = readonly JournalEntry[]

/* ─── Chat Models ─── */

export interface ChatMessage {
  readonly id: number | string
  readonly session_id: number | string
  readonly sender: ChatSender
  readonly content: string
  readonly created_at: string
}

export interface ChatSession {
  readonly id: number | string
  readonly user_id: number | string
  readonly status: ChatSessionStatus
  readonly title?: string | null
  readonly messages?: readonly ChatMessage[]
  readonly started_at?: string
  readonly ended_at?: string | null
  readonly created_at?: string
  /* Allow extra fields from backend */
  readonly [key: string]: unknown
}

export interface ChatSessionSummary {
  readonly id: number | string
  readonly title?: string | null
  readonly status: ChatSessionStatus
  readonly message_count?: number
  readonly updated_at: string
}

/* ─── Achievements & Streak Models ─── */

export interface Achievement {
  readonly id: number | string
  readonly code: AchievementCode
  readonly title: string
  readonly description: string
  readonly icon?: string | null
  readonly icon_url?: string | null
}

export interface UserAchievement {
  readonly id: number | string
  readonly user_id?: number | string
  readonly achievement_id?: number | string
  readonly earned_at: string
  readonly achievement?: Achievement
  readonly title?: string
  readonly description?: string
  readonly code?: string
}

export interface UserStreakInfo {
  readonly current_streak: number
  readonly longest_streak: number
  readonly last_logged_date?: string | null
}

export interface UserAchievementsAndStreakResponse {
  readonly earned_achievements: readonly UserAchievement[]
  readonly current_streak: number
  readonly longest_streak: number
  readonly last_logged_date?: string | null
  readonly journal_count?: number
  readonly mood_count?: number
  readonly chat_count?: number
}

/* ─── Content Models ─── */

export interface ContentItem {
  readonly id: number | string
  readonly content_type?: ContentType
  readonly type?: ContentType | string
  readonly text: string
  readonly author?: string | null
  readonly category?: string | null
  readonly created_at?: string
}

/* ─── Emergency & Crisis Models ─── */

export interface HelplineResource {
  readonly id: number | string
  readonly country_code: string
  readonly organization_name: string
  readonly phone_number: string
  readonly website_url?: string | null
  readonly description?: string | null
  readonly is_active?: boolean
  readonly is_24_7?: boolean
  readonly availability?: string | null
}

export interface CalmingTip {
  readonly id: string
  readonly title: string
  readonly category?: string
  readonly description: string
  readonly steps?: readonly string[]
}

export interface EmergencyEscalation {
  readonly session_id: number | string
  readonly severity: CrisisSeverity
  readonly reason: string
  readonly helplines: readonly HelplineResource[]
}

/* ─── Notification Models ─── */

export interface Notification {
  readonly id: string
  readonly user_id?: number | string
  readonly title: string
  readonly message: string
  readonly read: boolean
  readonly created_at: string
  readonly category?: string
}

/* ─── Standardized API Response Envelopes ─── */

export interface PaginationMeta {
  readonly page: number
  readonly limit: number
  readonly total: number
  readonly total_pages: number
}
