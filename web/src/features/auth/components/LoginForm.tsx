import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { toast } from 'sonner'
import { Mail, LockKeyhole, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'

import { AppLogo } from '@/components/AppLogo'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { useOAuth2Login } from '@/features/auth/hooks/useOAuth2Login'
import { OAuthModal } from '@/features/auth/components/OAuthModal'
import { ROUTES } from '@/app/router/routes'
import { useLoadingStore } from '@/stores/useLoadingStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner'
import { BackgroundEffects } from '@/components/background/BackgroundEffects'
import { GlassCard } from '@/components/ui/GlassCard'

/* ─── Zod Validation Schema ─── */
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email address is required.' })
    .email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(1, { message: 'Password is required.' })
    .min(8, { message: 'Password must be at least 8 characters.' }),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export interface LoginFormProps {
  embedded?: boolean
  onSwitchToRegister?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ embedded = false, onSwitchToRegister }) => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [oauthProvider, setOauthProvider] = useState<'google' | 'github' | null>(null)
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false)

  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  const { mutate: login, isPending, error: serverError } = useLogin()
  const { mutate: oauthLogin, isPending: isOAuthPending } = useOAuth2Login()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleOpenOAuthModal = (provider: 'google' | 'github') => {
    setOauthProvider(provider)
    setIsOAuthModalOpen(true)
  }

  const handlePerformOAuthLoginToken = (provider: string, token: string) => {
    toast.info(`Initiating OAuth2 identity verification via ${provider.toUpperCase()}...`, {
      description: 'Validating token signature with official provider API...',
    })

    oauthLogin(
      {
        provider,
        token,
      },
      {
        onSuccess: () => {
          setIsOAuthModalOpen(false)
          toast.success(`Successfully authenticated via ${provider.toUpperCase()} OAuth2!`, {
            description: 'User identity and email ownership verified.',
          })
        },
        onError: (err) => {
          toast.error(`OAuth2 verification failed`, {
            description: err.message || 'Unable to verify OAuth token signature with provider.',
          })
        },
      }
    )
  }

  const handleAuthNav = (path: string, message: string) => {
    useLoadingStore.getState().show(message)
    navigate(path)
  }

  const onSubmit = (data: LoginFormValues) => {
    login(data, {
      onSuccess: () => {
        toast.success('Welcome back to Kintsugi!', {
          description: 'Session authenticated successfully.',
        })
      },
      onError: (err) => {
        toast.error('Authentication failed', {
          description: err.message || 'Please verify your credentials.',
        })
      },
    })
  }

  const formBody = (
    <div className="space-y-4 w-full">
      {/* Server Error Alert */}
      {serverError && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-300 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <AlertTitle className="font-semibold text-xs">Authentication Error</AlertTitle>
          <AlertDescription className="text-[11px] text-red-300/90 leading-relaxed">
            {serverError.message || 'Incorrect email or password. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5 text-left">
          <Label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              disabled={isPending || isOAuthPending}
              className="pl-10 h-11 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-violet-500 focus:ring-violet-500/20 rounded-xl text-xs sm:text-sm transition-all"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-500 font-medium pl-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <button
              type="button"
              onClick={() => handleAuthNav(ROUTES.AUTH.FORGOT_PASSWORD, 'Loading Password Recovery...')}
              className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isPending || isOAuthPending}
              className="pl-10 pr-10 h-11 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-violet-500 focus:ring-violet-500/20 rounded-xl text-xs sm:text-sm transition-all"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isPending || isOAuthPending}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-rose-500 font-medium pl-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <motion.div whileHover={isAnimated && !isPending && !isOAuthPending ? { scale: 1.01 } : undefined} whileTap={isAnimated && !isPending && !isOAuthPending ? { scale: 0.98 } : undefined}>
          <Button
            type="submit"
            disabled={isPending || isOAuthPending}
            className="w-full h-11 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-600/30 transition-all gap-2 border border-violet-400/20 text-sm cursor-pointer"
          >
            {isPending ? (
              <LoadingSpinner size="sm" label="Signing in..." />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 text-violet-200" />
              </>
            )}
          </Button>
        </motion.div>
      </form>

      {/* OAuth2 Provider Section */}
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
          <span className="bg-card px-2 text-muted-foreground font-semibold">Or continue with OAuth2</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Button
          type="button"
          variant="outline"
          disabled={isPending || isOAuthPending}
          onClick={() => handleOpenOAuthModal('google')}
          className="h-10 border-border bg-background/50 hover:bg-violet-500/10 hover:border-violet-500/30 rounded-xl text-xs font-semibold gap-2 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Google</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isPending || isOAuthPending}
          onClick={() => handleOpenOAuthModal('github')}
          className="h-10 border-border bg-background/50 hover:bg-violet-500/10 hover:border-violet-500/30 rounded-xl text-xs font-semibold gap-2 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0 fill-current text-foreground" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span>GitHub</span>
        </Button>
      </div>

      <OAuthModal
        isOpen={isOAuthModalOpen}
        provider={oauthProvider}
        onClose={() => setIsOAuthModalOpen(false)}
        onAuthenticateToken={handlePerformOAuthLoginToken}
        isPending={isOAuthPending}
      />
    </div>
  )

  if (embedded) {
    return formBody
  }

  return (
    <div className="w-full h-screen max-h-screen flex items-center justify-center p-4 bg-background text-foreground relative overflow-hidden select-none transition-colors">
      <BackgroundEffects />
      <motion.div
        className="max-w-md w-full relative z-10"
        initial={isAnimated ? { opacity: 0, y: 20, scale: 0.96 } : undefined}
        animate={isAnimated ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        <GlassCard accentColor="purple" hoverEffect={false} className="p-5 sm:p-6 space-y-4 shadow-2xl rounded-2xl border-border bg-card text-card-foreground">
          <div className="flex flex-col items-center text-center space-y-2">
            <button
              type="button"
              onClick={() => handleAuthNav(ROUTES.PUBLIC.HOME, 'Loading Home...')}
              className="focus:outline-none cursor-pointer"
            >
              <AppLogo size={40} showText={true} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-card-foreground sm:text-2xl pt-1 font-serif">
              Welcome Back
            </h1>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Sign in to continue your personal journey of growth and restoration.
            </p>
          </div>

          {formBody}

          <div className="pt-2 border-t border-border text-center text-xs text-muted-foreground">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister || (() => handleAuthNav(ROUTES.AUTH.REGISTER, 'Loading Registration...'))}
              className="font-semibold text-violet-600 dark:text-violet-400 hover:underline transition-colors cursor-pointer"
            >
              Create account
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default LoginForm
