/**
 * Centralized strongly-typed routing contract for Kintsugi Web Application.
 * Single source of truth for all application URLs and dynamic route builders.
 */

export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    FEATURES: '/features',
    HOW_IT_WORKS: '/how-it-works',
    AI_COMPANION: '/ai-companion',
    TECHNOLOGY: '/technology',
    SAFETY: '/safety',
    CRISIS_SUPPORT: '/crisis-support',
    PRIVACY_POLICY: '/privacy-policy',
    TERMS: '/terms',
    MEDICAL_DISCLAIMER: '/medical-disclaimer',
    FAQ: '/faq',
    ABOUT: '/about',
  },

  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
  },

  APP: {
    DASHBOARD: '/app',
  },

  MOOD: {
    TRACKER: '/app/mood',
    HISTORY: '/app/mood/history',
  },

  CHAT: {
    COMPANION: '/app/chat',
    SESSION: (sessionId: string) => `/app/chat/${sessionId}`,
  },

  JOURNAL: {
    LIST: '/app/journal',
    ENTRY: (entryId: string) => `/app/journal/${entryId}`,
  },

  WELLNESS: {
    BREATHING: '/app/breathing',
    MOTIVATION: '/app/motivation',
    MIND_GAME: '/app/mind-game',
  },

  EMERGENCY: {
    HELP: '/app/emergency',
    HELPLINES: '/app/emergency/helplines',
  },

  USER: {
    PROFILE: '/app/profile',
    SETTINGS: '/app/settings',
    NOTIFICATIONS: '/app/notifications',
    ACHIEVEMENTS: '/app/achievements',
    ABOUT: '/app/about',
  },
} as const

/* ─── Type Definitions ─── */
export type PublicRoutes =
  | typeof ROUTES.PUBLIC.HOME
  | typeof ROUTES.PUBLIC.FEATURES
  | typeof ROUTES.PUBLIC.HOW_IT_WORKS
  | typeof ROUTES.PUBLIC.AI_COMPANION
  | typeof ROUTES.PUBLIC.TECHNOLOGY
  | typeof ROUTES.PUBLIC.SAFETY
  | typeof ROUTES.PUBLIC.CRISIS_SUPPORT
  | typeof ROUTES.PUBLIC.PRIVACY_POLICY
  | typeof ROUTES.PUBLIC.TERMS
  | typeof ROUTES.PUBLIC.MEDICAL_DISCLAIMER
  | typeof ROUTES.PUBLIC.FAQ
  | typeof ROUTES.PUBLIC.ABOUT
  | typeof ROUTES.AUTH.LOGIN
  | typeof ROUTES.AUTH.REGISTER
  | typeof ROUTES.AUTH.FORGOT_PASSWORD
  | typeof ROUTES.AUTH.RESET_PASSWORD

export type ProtectedRoutes =
  | typeof ROUTES.APP.DASHBOARD
  | typeof ROUTES.MOOD.TRACKER
  | typeof ROUTES.MOOD.HISTORY
  | typeof ROUTES.CHAT.COMPANION
  | typeof ROUTES.JOURNAL.LIST
  | typeof ROUTES.WELLNESS.BREATHING
  | typeof ROUTES.WELLNESS.MOTIVATION
  | typeof ROUTES.EMERGENCY.HELP
  | typeof ROUTES.EMERGENCY.HELPLINES
  | typeof ROUTES.USER.PROFILE
  | typeof ROUTES.USER.SETTINGS
  | typeof ROUTES.USER.NOTIFICATIONS
  | typeof ROUTES.USER.ACHIEVEMENTS

export type RoutePath = PublicRoutes | ProtectedRoutes | string

export default ROUTES
