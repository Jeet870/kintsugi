import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Mail, KeyRound, LockKeyhole, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface ForgotPasswordFormProps {
  onBackToLogin: () => void
}

type Step = 'email' | 'otp' | 'reset' | 'success'

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(60)

  // Resend Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (step === 'otp' && resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [step, resendCooldown])

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      setLoading(false)
      toast.success('Verification code sent!', {
        description: data.message || 'If an account exists, a code has been sent.',
      })
      setStep('otp')
      setResendCooldown(60)
    } catch {
      setLoading(false)
      toast.success('Verification code sent!', {
        description: 'If an account exists, a code has been sent.',
      })
      setStep('otp')
      setResendCooldown(60)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      setLoading(false)

      if (!res.ok) {
        setError(data.detail || 'The verification code is incorrect or expired.')
        return
      }

      setResetToken(data.reset_token)
      toast.success('Code verified successfully!')
      setStep('reset')
    } catch (err: any) {
      setLoading(false)
      setError('Unable to verify code. Please try again.')
    }
  }

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (newPassword.length < 12) {
      setError('Password must be at least 12 characters long.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
      })
      const data = await res.json()
      setLoading(false)

      if (!res.ok) {
        setError(data.detail || 'Unable to reset password.')
        return
      }

      toast.success('Password reset successfully!')
      setStep('success')
    } catch {
      setLoading(false)
      setError('Unable to reset password. Please check password security requirements.')
    }
  }

  return (
    <div className="space-y-4 w-full text-left select-none">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* ── STEP 1: Enter Email ── */}
      {step === 'email' && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 h-11 bg-background border-border text-foreground rounded-xl text-xs sm:text-sm"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl gap-2 cursor-pointer"
          >
            {loading ? 'Sending Code...' : 'Send Verification Code ✦'}
          </Button>
        </form>
      )}

      {/* ── STEP 2: Verify OTP ── */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              6-Digit Verification Code
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                maxLength={6}
                placeholder="582731"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                className="pl-10 h-11 tracking-widest text-center text-lg font-bold bg-background border-border text-foreground rounded-xl"
              />
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              Check your email ({email}) for your 6-digit code. Valid for 10 minutes.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Didn\'t get a code?'}
            </span>
            {resendCooldown === 0 && (
              <button
                type="button"
                onClick={handleRequestOtp}
                className="text-violet-400 font-semibold hover:underline cursor-pointer"
              >
                Resend Code
              </button>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl gap-2 cursor-pointer"
          >
            {loading ? 'Verifying...' : 'Verify Security Code ✦'}
          </Button>
        </form>
      )}

      {/* ── STEP 3: Reset Password ── */}
      {step === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              New Password
            </Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="pl-10 h-11 bg-background border-border text-foreground rounded-xl text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Confirm New Password
            </Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pl-10 h-11 bg-background border-border text-foreground rounded-xl text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl space-y-1 text-[11px]">
            <p className="font-semibold text-violet-400">Password Requirements:</p>
            <p className={newPassword.length >= 12 ? 'text-emerald-400' : 'text-muted-foreground'}>• At least 12 characters</p>
            <p className={/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? 'text-emerald-400' : 'text-muted-foreground'}>• Uppercase & lowercase letters</p>
            <p className={/\d/.test(newPassword) ? 'text-emerald-400' : 'text-muted-foreground'}>• At least one number (0-9)</p>
            <p className={/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(newPassword) ? 'text-emerald-400' : 'text-muted-foreground'}>• At least one special symbol</p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl gap-2 cursor-pointer"
          >
            {loading ? 'Updating Password...' : 'Reset Password ✦'}
          </Button>
        </form>
      )}

      {/* ── STEP 4: Success ── */}
      {step === 'success' && (
        <div className="text-center space-y-4 py-2">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Password Reset Complete</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your password has been changed successfully. All active sessions have been safely revoked.
          </p>
          <Button
            onClick={onBackToLogin}
            className="w-full h-11 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl gap-2 cursor-pointer"
          >
            <span>Back to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {step !== 'success' && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            ← Back to Sign In
          </button>
        </div>
      )}
    </div>
  )
}
