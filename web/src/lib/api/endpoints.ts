/**
 * Centralized registry of backend REST API endpoints for Kintsugi Web Application.
 * Synchronized with FastAPI /api/v1 router contract.
 *
 * Single source of truth — do not hardcode URL paths inside feature modules or hooks.
 */

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },

  USERS: {
    ME: '/users/me',
    PROFILE: '/users/profile',
  },

  PROFILE: {
    ME: '/users/me',
    STREAK: '/achievements/me',
    ACHIEVEMENTS: '/achievements/me',
  },

  MOOD: {
    CREATE: '/mood/',
    HISTORY: '/mood/history',
  },

  JOURNAL: {
    CREATE: '/journal/',
    LIST: '/journal/',
    DETAIL: (id: string) => `/journal/${id}`,
    UPDATE: (id: string) => `/journal/${id}`,
    DELETE: (id: string) => `/journal/${id}`,
  },

  CHAT: {
    CREATE_SESSION: '/chat/sessions',
    SESSION_DETAIL: (sessionId: string) => `/chat/sessions/${sessionId}`,
    SEND_MESSAGE: (sessionId: string) => `/chat/sessions/${sessionId}/messages`,
  },

  CONTENT: {
    DAILY: '/content/daily',
    QUOTE: '/content/quote',
    DAILY_QUOTE: '/content/quote',
    AFFIRMATIONS: '/content?item_type=affirmation',
    DAILY_AFFIRMATIONS: '/content?item_type=affirmation',
    TIPS: '/content/tips',
    SELF_CARE_TIPS: '/content/tips',
  },

  EMERGENCY: {
    HELPLINES: '/emergency/helplines',
    CALMING: '/emergency/calming-tips',
    CALMING_TIPS: '/emergency/calming-tips',
  },

  ACHIEVEMENTS: {
    CATALOG: '/achievements',
    USER: '/achievements/me',
    ME: '/achievements/me',
  },

  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: string) => `/notifications/${id}`,
    CLEAR_ALL: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
  },

  SETTINGS: {
    PREFERENCES: '/users/settings',
  },

  HEALTH: {
    CHECK: '/health',
  },
} as const

/* Alias for backward compatibility across internal modules */
export const ENDPOINTS = API_ENDPOINTS

export default API_ENDPOINTS
