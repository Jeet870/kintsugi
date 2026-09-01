import { queryClient } from '@/lib/query/queryClient'
import { queryKeys } from '@/lib/query/queryKeys'
import { ROUTES } from '@/app/router/routes'
import { moodApi } from '@/features/mood-tracker/api/moodApi'
import apiClient from '@/lib/api/apiClient'
import { ENDPOINTS } from '@/lib/api/endpoints'

/* Route Bundle Preloader Registry */
const routeImporters: Record<string, () => Promise<unknown>> = {
  [ROUTES.PUBLIC.HOME]: () => import('@/pages/LandingPage'),
  [ROUTES.PUBLIC.FEATURES]: () => import('@/pages/landing/FeaturesPage'),
  [ROUTES.PUBLIC.HOW_IT_WORKS]: () => import('@/pages/landing/HowItWorksPage'),
  [ROUTES.PUBLIC.AI_COMPANION]: () => import('@/features/ai-companion/pages/AICompanionPage'),
  [ROUTES.PUBLIC.TECHNOLOGY]: () => import('@/pages/landing/TechnologyPage'),
  [ROUTES.PUBLIC.SAFETY]: () => import('@/pages/landing/SafetyPage'),
  [ROUTES.PUBLIC.CRISIS_SUPPORT]: () => import('@/pages/landing/CrisisSupportPage'),
  [ROUTES.PUBLIC.FAQ]: () => import('@/pages/landing/FAQPage'),
  [ROUTES.PUBLIC.PRIVACY_POLICY]: () => import('@/pages/landing/PrivacyPolicyPage'),
  [ROUTES.PUBLIC.TERMS]: () => import('@/pages/landing/TermsPage'),
  [ROUTES.PUBLIC.MEDICAL_DISCLAIMER]: () => import('@/pages/landing/MedicalDisclaimerPage'),
  [ROUTES.PUBLIC.ABOUT]: () => import('@/pages/landing/AboutPage'),
  [ROUTES.AUTH.LOGIN]: () => import('@/features/auth/components/LoginForm'),
  [ROUTES.AUTH.REGISTER]: () => import('@/features/auth/components/RegisterForm'),
  [ROUTES.APP.DASHBOARD]: () => import('@/pages/AppDashboard'),
}

/* In-memory set tracking prefetched route bundles to avoid redundant work */
const prefetchedRoutes = new Set<string>()

/**
 * Intelligent Route & Data Prefetcher.
 * Preloads both the JS bundle and backend server queries on user hover or focus,
 * delivering 0ms instantaneous page transitions.
 */
export function prefetchRoute(path: string): void {
  if (!path || prefetchedRoutes.has(path)) return
  prefetchedRoutes.add(path)

  /* 1. Preload JS Component Bundle */
  const importer = routeImporters[path]
  if (importer) {
    importer().catch(() => {
      prefetchedRoutes.delete(path)
    })
  }

  /* 2. Preload React Query Backend Data when entering app surfaces */
  if (path === ROUTES.APP.DASHBOARD || path.startsWith('/app')) {
    queryClient
      .prefetchQuery({
        queryKey: queryKeys.users.profile('me'),
        queryFn: async () => {
          const res = await apiClient.get(ENDPOINTS.USERS.ME)
          return res.data
        },
        staleTime: 1000 * 60 * 5,
      })
      .catch(() => {})

    queryClient
      .prefetchQuery({
        queryKey: queryKeys.mood.history('me'),
        queryFn: () => moodApi.getMoodHistory({ skip: 0, limit: 50 }),
        staleTime: 1000 * 60 * 5,
      })
      .catch(() => {})
  }
}

export default prefetchRoute
