import React, { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { toast } from 'sonner'
import {
  UserRound,
  Mail,
  LockKeyhole,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Check,
  X,
} from 'lucide-react'

import { AppLogo } from '@/components/AppLogo'
import { useRegister } from '@/features/auth/hooks/useRegister'
import { ROUTES } from '@/app/router/routes'
import { useLoadingStore } from '@/stores/useLoadingStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner'
import { BackgroundEffects } from '@/components/background/BackgroundEffects'
import { GlassCard } from '@/components/ui/GlassCard'

/* ─── Zod Validation Schema matching backend UserCreate requirements ─── */
const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: 'Full name is required.' })
      .max(100, { message: 'Name cannot exceed 100 characters.' }),
    email: z
      .string()
      .trim()
      .min(1, { message: 'Email address is required.' })
      .email({ message: 'Please enter a valid email address.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
      .regex(/\d/, { message: 'Password must contain at least one digit.' })
      .regex(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/, {
        message: 'Password must contain at least one special character.',
      }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

export interface RegisterFormProps {
  embedded?: boolean
  onSwitchToLogin?: () => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ embedded = false, onSwitchToLogin }) => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  const { mutate: registerUser, isPending, error: serverError } = useRegister()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const watchPassword = watch('password', '')

  const handleAuthNav = (path: string, message: string) => {
    useLoadingStore.getState().show(message)
    navigate(path)
  }

  /* Live Password Strength Score (0 to 5) */
  const passwordCriteria = useMemo(() => {
    const pwd = watchPassword || ''
    return {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      digit: /\d/.test(pwd),
      special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd),
    }
  }, [watchPassword])

  const strengthScore = useMemo(() => {
    return Object.values(passwordCriteria).filter(Boolean).length
  }, [passwordCriteria])

  const strengthLabel = useMemo(() => {
    if (strengthScore <= 1) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-400' }
    if (strengthScore <= 3) return { label: 'Medium', color: 'bg-amber-500', text: 'text-amber-400' }
    if (strengthScore === 4) return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' }
    return { label: 'Robust', color: 'bg-violet-500', text: 'text-violet-400' }
  }, [strengthScore])

  const onSubmit = (data: RegisterFormValues) => {
    registerUser(
      {
        name: data.name,
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          toast.success('Account created successfully!', {
            description: 'Welcome to Kintsugi. Your account is ready.',
          })
        },
        onError: (err) => {
          toast.error('Registration failed', {
            description: err.message || 'Please check your inputs and try again.',
          })
        },
      },
    )
  }

  const formBody = (
    <div className="space-y-3 w-full">
      {/* Server Error Alert */}
      {serverError && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-300 rounded-lg p-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <AlertTitle className="font-semibold text-xs">Registration Failure</AlertTitle>
          <AlertDescription className="text-[11px] text-red-300/90 leading-tight">
            {serverError.message || 'An error occurred during account creation. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5" noValidate>
        {/* Full Name & Email Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          <div className="space-y-1">
            <Label htmlFor="reg-name" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Full Name
            </Label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                id="reg-name"
                type="text"
                placeholder="Jane Doe"
                autoComplete="name"
                disabled={isPending}
                className="pl-9 h-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-violet-500 focus:ring-violet-500/20 rounded-xl text-xs transition-all"
                {...register('name')}
              />
            </div>
            {errors.name && <p className="text-[10px] text-rose-500 font-medium pl-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="reg-email" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                id="reg-email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                disabled={isPending}
                className="pl-9 h-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-violet-500 focus:ring-violet-500/20 rounded-xl text-xs transition-all"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-[10px] text-rose-500 font-medium pl-1">{errors.email.message}</p>}
          </div>
        </div>

        {/* Password & Confirm Password Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          <div className="space-y-1">
            <Label htmlFor="reg-password" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isPending}
                className="pl-9 pr-8 h-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-violet-500 focus:ring-violet-500/20 rounded-xl text-xs transition-all"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isPending}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-rose-500 font-medium pl-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="reg-confirmPassword" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Confirm Password
            </Label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                id="reg-confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isPending}
                className="pl-9 pr-8 h-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-violet-500 focus:ring-violet-500/20 rounded-xl text-xs transition-all"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isPending}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[10px] text-rose-500 font-medium pl-1">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {/* Password Strength Indicator */}
        {watchPassword && (
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border space-y-1 text-[11px] text-left">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Password Strength</span>
              <span className={`font-semibold ${strengthLabel.text}`}>{strengthLabel.label}</span>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden flex gap-1 p-0.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-full flex-1 rounded-full transition-all duration-300 ${
                    level <= strengthScore ? strengthLabel.color : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1 pt-0.5 text-[10px]">
              <span className={`flex items-center gap-1 ${passwordCriteria.length ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                {passwordCriteria.length ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />} 8+ chars
              </span>
              <span className={`flex items-center gap-1 ${passwordCriteria.uppercase ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                {passwordCriteria.uppercase ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />} Uppercase
              </span>
              <span className={`flex items-center gap-1 ${passwordCriteria.lowercase ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                {passwordCriteria.lowercase ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />} Lowercase
              </span>
              <span className={`flex items-center gap-1 ${passwordCriteria.digit ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                {passwordCriteria.digit ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />} Number
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <motion.div whileHover={isAnimated && !isPending ? { scale: 1.01 } : undefined} whileTap={isAnimated && !isPending ? { scale: 0.98 } : undefined} className="pt-1">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-10 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-600/30 transition-all gap-2 border border-violet-400/20 text-xs sm:text-sm cursor-pointer"
          >
            {isPending ? (
              <LoadingSpinner size="sm" label="Creating account..." />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 text-violet-200" />
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  )

  if (embedded) {
    return formBody
  }

  return (
    <div className="w-full h-screen max-h-screen flex items-center justify-center p-3 sm:p-4 bg-background text-foreground relative overflow-hidden select-none transition-colors">
      <BackgroundEffects />
      <motion.div
        className="max-w-md w-full relative z-10"
        initial={isAnimated ? { opacity: 0, y: 20, scale: 0.96 } : undefined}
        animate={isAnimated ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        <GlassCard accentColor="purple" hoverEffect={false} className="p-4 sm:p-5 space-y-3 shadow-2xl rounded-2xl border-border bg-card text-card-foreground">
          <div className="flex flex-col items-center text-center space-y-1.5">
            <button
              type="button"
              onClick={() => handleAuthNav(ROUTES.PUBLIC.HOME, 'Loading Home...')}
              className="focus:outline-none cursor-pointer"
            >
              <AppLogo size={36} showText={true} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-card-foreground sm:text-2xl font-serif">
              Create Account
            </h1>
            <p className="text-[11px] text-muted-foreground max-w-xs leading-tight">
              Begin your personal mental wellness journey with a private, supportive space.
            </p>
          </div>

          {formBody}

          <div className="pt-2 border-t border-border text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin || (() => handleAuthNav(ROUTES.AUTH.LOGIN, 'Loading Sign In...'))}
              className="font-semibold text-violet-600 dark:text-violet-400 hover:underline transition-colors cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default RegisterForm
