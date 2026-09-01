/**
 * Centralized, strongly typed Query Key Factory for Kintsugi Web Application.
 * Single source of truth for TanStack Query keys, cache invalidation, optimistic updates,
 * and realtime WebSocket event handlers.
 */

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    currentUser: ['auth', 'currentUser'] as const,
    session: ['auth', 'session'] as const,
  },

  users: {
    all: ['users'] as const,
    profile: (userId: string = 'me') => ['users', 'profile', userId] as const,
    preferences: ['users', 'preferences'] as const,
  },

  profile: {
    all: ['profile'] as const,
    me: () => ['profile', 'me'] as const,
    streak: () => ['profile', 'streak'] as const,
    achievements: () => ['profile', 'achievements'] as const,
  },

  mood: {
    all: ['mood'] as const,
    history: (userId: string = 'me') => ['mood', 'history', userId] as const,
    latest: (userId: string = 'me') => ['mood', 'latest', userId] as const,
    streak: (userId: string = 'me') => ['mood', 'streak', userId] as const,
    statistics: (userId: string = 'me') => ['mood', 'statistics', userId] as const,
  },

  journal: {
    all: ['journal'] as const,
    list: (userId: string = 'me') => ['journal', 'list', userId] as const,
    detail: (userId: string = 'me', entryId: string = '') => ['journal', 'detail', userId, entryId] as const,
  },

  chat: {
    all: ['chat'] as const,
    sessions: (userId: string = 'me') => ['chat', 'sessions', userId] as const,
    session: (sessionId: string) => ['chat', 'session', sessionId] as const,
    messages: (sessionId: string) => ['chat', 'messages', sessionId] as const,
  },

  achievements: {
    all: ['achievements'] as const,
    catalog: ['achievements', 'catalog'] as const,
    user: (userId: string = 'me') => ['achievements', 'user', userId] as const,
    me: ['achievements', 'me'] as const,
  },

  notifications: {
    all: ['notifications'] as const,
    unread: ['notifications', 'unread'] as const,
    list: (userId: string = 'me') => ['notifications', 'list', userId] as const,
  },

  emergency: {
    all: ['emergency'] as const,
    helplines: (countryCode: string = 'ALL') => ['emergency', 'helplines', countryCode] as const,
    calmingTips: ['emergency', 'calmingTips'] as const,
  },

  content: {
    all: ['content'] as const,
    dailyQuote: ['content', 'dailyQuote'] as const,
    affirmations: ['content', 'affirmations'] as const,
    motivation: ['content', 'motivation'] as const,
    tips: ['content', 'tips'] as const,
    daily: (userId?: string | number, dateStr?: string) =>
      ['content', 'daily', userId ?? 'me', dateStr ?? new Date().toISOString().split('T')[0]] as const,
  },

  settings: {
    all: ['settings'] as const,
    profile: ['settings', 'profile'] as const,
    appearance: ['settings', 'appearance'] as const,
    notifications: ['settings', 'notifications'] as const,
  },
} as const

export type QueryKeys = typeof queryKeys
export default queryKeys
