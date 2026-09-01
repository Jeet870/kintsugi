import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ROUTES } from '@/app/router/routes'
import { ProtectedRoute } from '@/app/router/ProtectedRoute'
import { RouteTransition } from '@/components/loading/RouteTransition'
import { SkeletonPageLoader } from '@/components/loading/SkeletonPageLoader'
import { LandingLayout } from '@/components/layout/LandingLayout'

/* ─── Route-Based Code Splitting: Lazy-Loaded Page Bundles ─── */
const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })),
)
const FeaturesPage = lazy(() => import('@/pages/landing/FeaturesPage'))
const HowItWorksPage = lazy(() => import('@/pages/landing/HowItWorksPage'))
const AICompanionPage = lazy(() => import('@/pages/landing/AICompanionPage'))
const TechnologyPage = lazy(() => import('@/pages/landing/TechnologyPage'))
const SafetyPage = lazy(() => import('@/pages/landing/SafetyPage'))
const CrisisSupportPage = lazy(() => import('@/pages/landing/CrisisSupportPage'))
const FAQPage = lazy(() => import('@/pages/landing/FAQPage'))
const PrivacyPolicyPage = lazy(() => import('@/pages/landing/PrivacyPolicyPage'))
const TermsPage = lazy(() => import('@/pages/landing/TermsPage'))
const MedicalDisclaimerPage = lazy(() => import('@/pages/landing/MedicalDisclaimerPage'))

/* ─── Lazy Loaded Auth & App Dashboard Components ─── */
const AuthPage = lazy(() => import('@/features/auth/pages/AuthPage'))
const MoodTrackerPage = lazy(() => import('@/features/mood-tracker/pages/MoodTrackerPage'))
const JournalPage = lazy(() => import('@/features/journal/pages/JournalPage'))
const BreathingExercisePage = lazy(() => import('@/features/breathing-exercise/pages/BreathingExercisePage'))
const DailyMotivationPage = lazy(() => import('@/features/daily-motivation/pages/DailyMotivationPage'))
const EmergencyHelpPage = lazy(() => import('@/features/emergency-help/pages/EmergencyHelpPage'))
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'))
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'))
const MindGamePage = lazy(() => import('@/features/mind-game/pages/MindGamePage'))
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage'))
const AchievementsPage = lazy(() => import('@/features/achievements/pages/AchievementsPage'))
const AppDashboard = lazy(() =>
  import('@/pages/AppDashboard').then((m) => ({ default: m.AppDashboard })),
)
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<SkeletonPageLoader />}>
        <RouteTransition>
          <Routes>
            {/* ── Public Product & Technical Pages Wrapped in Persistent Layout Shell ── */}
            <Route element={<LandingLayout />}>
              <Route path={ROUTES.PUBLIC.HOME} element={<LandingPage />} />
              <Route path={ROUTES.PUBLIC.FEATURES} element={<FeaturesPage />} />
              <Route path={ROUTES.PUBLIC.HOW_IT_WORKS} element={<HowItWorksPage />} />
              <Route path={ROUTES.PUBLIC.AI_COMPANION} element={<AICompanionPage />} />
              <Route path={ROUTES.PUBLIC.TECHNOLOGY} element={<TechnologyPage />} />
              <Route path={ROUTES.PUBLIC.SAFETY} element={<SafetyPage />} />
              <Route path={ROUTES.PUBLIC.CRISIS_SUPPORT} element={<CrisisSupportPage />} />
              <Route path={ROUTES.PUBLIC.FAQ} element={<FAQPage />} />
              <Route path={ROUTES.PUBLIC.PRIVACY_POLICY} element={<PrivacyPolicyPage />} />
              <Route path={ROUTES.PUBLIC.TERMS} element={<TermsPage />} />
              <Route path={ROUTES.PUBLIC.MEDICAL_DISCLAIMER} element={<MedicalDisclaimerPage />} />
            </Route>

            {/* ── Authentication Routes ── */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path={ROUTES.AUTH.LOGIN} element={<AuthPage initialMode="login" />} />
            <Route path={ROUTES.AUTH.REGISTER} element={<AuthPage initialMode="register" />} />
            <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<AuthPage initialMode="login" />} />
            <Route path={ROUTES.AUTH.RESET_PASSWORD} element={<AuthPage initialMode="login" />} />

            {/* ── Protected Application Routes ── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/mood" element={<MoodTrackerPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/breathing" element={<BreathingExercisePage />} />
              <Route path="/motivation" element={<DailyMotivationPage />} />
              <Route path="/emergency" element={<EmergencyHelpPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/mind-game" element={<MindGamePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/about" element={<AppDashboard />} />
              <Route path="/app/about" element={<AppDashboard />} />
              <Route path="/app/notifications" element={<AppDashboard />} />
              <Route path="/app/achievements" element={<AppDashboard />} />
              <Route path={ROUTES.APP.DASHBOARD} element={<AppDashboard />} />
              <Route path={ROUTES.MOOD.TRACKER} element={<AppDashboard />} />
              <Route path={ROUTES.MOOD.HISTORY} element={<AppDashboard />} />
              <Route path={ROUTES.CHAT.COMPANION} element={<AppDashboard />} />
              <Route path="/app/chat/:sessionId" element={<AppDashboard />} />
              <Route path={ROUTES.JOURNAL.LIST} element={<AppDashboard />} />
              <Route path="/app/journal/:entryId" element={<AppDashboard />} />
              <Route path={ROUTES.WELLNESS.BREATHING} element={<AppDashboard />} />
              <Route path={ROUTES.WELLNESS.MOTIVATION} element={<AppDashboard />} />
              <Route path={ROUTES.EMERGENCY.HELP} element={<AppDashboard />} />
              <Route path={ROUTES.EMERGENCY.HELPLINES} element={<AppDashboard />} />
              <Route path={ROUTES.USER.PROFILE} element={<AppDashboard />} />
              <Route path={ROUTES.USER.SETTINGS} element={<AppDashboard />} />
              <Route path={ROUTES.USER.NOTIFICATIONS} element={<AppDashboard />} />
              <Route path={ROUTES.USER.ACHIEVEMENTS} element={<AppDashboard />} />
              <Route path="/app/:tab" element={<AppDashboard />} />
            </Route>

            {/* ── Catch-All 404 Fallback ── */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </RouteTransition>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRouter
