import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SecurityLockIcon,
  HeartIcon,
  SparklesIcon,
  Shield02Icon,
} from '@hugeicons/core-free-icons'

import { AppLogo } from '@/components/AppLogo'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { ROUTES } from '@/app/router/routes'
import { useThemeStore } from '@/stores/useThemeStore'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { BackgroundEffects } from '@/components/background/BackgroundEffects'

import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'

export type AuthMode = 'login' | 'register' | 'forgot-password'

export interface AuthPageProps {
  /** Optional initial mode override ('login', 'register', or 'forgot-password') */
  initialMode?: AuthMode
  /** Optional custom CSS classes */
  className?: string
}

export const AuthPage: React.FC<AuthPageProps> = React.memo(
  ({ initialMode, className = '' }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const shouldReduceMotion = useReducedMotion()
    const isAnimated = !shouldReduceMotion

    // Access theme state from Zustand theme store
    const theme = useThemeStore((state) => state.theme)

    // Determine default mode from route or props
    const defaultMode: AuthMode = React.useMemo(() => {
      if (initialMode) return initialMode
      if (location.pathname.includes('/register')) return 'register'
      if (location.pathname.includes('/forgot-password')) return 'forgot-password'
      return 'login'
    }, [initialMode, location.pathname])

    const [mode, setMode] = useState<AuthMode>(defaultMode)

    // Sync mode state when external popstate or location changes
    useEffect(() => {
      if (location.pathname.includes('/register')) {
        setMode('register')
      } else if (location.pathname.includes('/forgot-password')) {
        setMode('forgot-password')
      } else if (location.pathname.includes('/login')) {
        setMode('login')
      }
    }, [location.pathname])

    // Instant smooth mode navigation without route unmounting flash
    const handleModeChange = (targetMode: AuthMode) => {
      setMode(targetMode)
      const targetPath =
        targetMode === 'register'
          ? ROUTES.AUTH.REGISTER
          : targetMode === 'forgot-password'
          ? ROUTES.AUTH.FORGOT_PASSWORD
          : ROUTES.AUTH.LOGIN
      if (window.location.pathname !== targetPath) {
        window.history.replaceState(null, '', targetPath)
      }
    }

    return (
      <main
        data-theme={theme}
        className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background text-foreground relative overflow-x-hidden selection:bg-violet-600 selection:text-white transition-colors ${className}`}
      >
        {/* ── Layer 1: Ambient Persisted Background Effects ── */}
        <BackgroundEffects />

        {/* ── Layer 2: Radial Soft Ambient Glow ── */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-radial from-violet-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none z-0"
        />

        {/* ── Layer 3: Main Responsive Container ── */}
        <div className="w-full max-w-5xl relative z-10 my-auto py-6 sm:py-10">
          <motion.div
            initial={isAnimated ? { opacity: 0, y: 16 } : undefined}
            animate={isAnimated ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
          >
            {/* ── Left Column: Kintsugi Branding & Value Illustration Panel ── */}
            <div className="lg:col-span-6 space-y-6 text-left hidden lg:flex flex-col justify-center">
              {/* Brand Logo & Tagline */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.PUBLIC.HOME)}
                  className="inline-flex items-center gap-3 group focus:outline-none cursor-pointer"
                  aria-label="Navigate to Kintsugi Home"
                >
                  <AppLogo size={48} showText={true} />
                </button>
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 w-fit"
                >
                  <HugeiconsIcon icon={SparklesIcon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>Mental Health & Emotional Companion</span>
                </Badge>
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-serif leading-tight">
                  Embrace Healing & Restore Strength
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Inspired by the ancient art of Kintsugi, we illuminate life’s repairs with gold. Your private space for reflection, mood tracking, and mindful growth.
                </p>
              </div>

              <Separator className="bg-border" />

              {/* Value Proposition Highlights */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400 shrink-0 mt-0.5">
                    <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      24/7 Conversational AI Companion
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Empathetic, non-judgmental support powered by low-latency Mistral AI.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5">
                    <HugeiconsIcon icon={Shield02Icon} className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Fernet Encrypted Private Vault
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your journal entries and reflections are encrypted symmetrically before storage.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0 mt-0.5">
                    <HugeiconsIcon icon={HeartIcon} className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Gentle Mood & Resilience Insights
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Track emotional patterns over time with zero pressure or judgment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <HugeiconsIcon icon={SecurityLockIcon} className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                <span>AES-256 Encryption · Confidential & Secure</span>
              </div>
            </div>

            {/* ── Right Column: Clean Authentication Card ── */}
            <div className="lg:col-span-6 flex flex-col justify-center items-center w-full">
              {/* Mobile Header Branding (Visible on small screens) */}
              <div className="flex flex-col items-center text-center space-y-3 mb-6 lg:hidden">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.PUBLIC.HOME)}
                  className="focus:outline-none cursor-pointer"
                  aria-label="Navigate to Kintsugi Home"
                >
                  <AppLogo size={42} showText={true} />
                </button>
              </div>

              {/* Authentication Form Card */}
              <Card className="w-full max-w-md border-border bg-card text-card-foreground shadow-2xl overflow-hidden rounded-2xl p-6 sm:p-8 space-y-6 hover:border-amber-500/40 transition-colors">
                {/* Form Card Header */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-card-foreground font-serif">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                    {mode === 'login'
                      ? 'Sign in to continue your personal journey of growth and restoration.'
                      : 'Begin your personal mental wellness journey with a private, supportive space.'}
                  </p>
                </div>

                {/* Form Content */}
                <CardContent className="p-0">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={mode}
                      initial={isAnimated ? { opacity: 0, y: 8 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      exit={isAnimated ? { opacity: 0, y: -8 } : undefined}
                      transition={{ duration: 0.15, ease: 'easeInOut' }}
                      className="w-full"
                    >
                      {mode === 'login' ? (
                        <LoginForm
                          embedded={true}
                          onSwitchToRegister={() => handleModeChange('register')}
                        />
                      ) : mode === 'register' ? (
                        <RegisterForm
                          embedded={true}
                          onSwitchToLogin={() => handleModeChange('login')}
                        />
                      ) : (
                        <ForgotPasswordForm
                          onBackToLogin={() => handleModeChange('login')}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </CardContent>

                {/* Bottom Footer Switcher Link */}
                <div className="pt-4 border-t border-border text-center text-xs text-muted-foreground">
                  {mode === 'login' ? (
                    <>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleModeChange('register')}
                        className="font-semibold text-violet-600 dark:text-violet-400 hover:underline transition-colors cursor-pointer"
                      >
                        Create account
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleModeChange('login')}
                        className="font-semibold text-violet-600 dark:text-violet-400 hover:underline transition-colors cursor-pointer"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              </Card>

              {/* Footer Terms & Safety Link */}
              <div className="mt-6 text-center text-xs text-muted-foreground space-y-1">
                <p>
                  By continuing, you agree to Kintsugi’s{' '}
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.PUBLIC.TERMS)}
                    className="underline text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.PUBLIC.PRIVACY_POLICY)}
                    className="underline text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                  .
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    )
  },
)

AuthPage.displayName = 'AuthPage'

export default AuthPage
