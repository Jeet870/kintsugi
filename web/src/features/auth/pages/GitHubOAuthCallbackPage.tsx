import React, { useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useGitHubCodeLogin } from '@/features/auth/hooks/useOAuth2Login'
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner'
import { GlassCard } from '@/components/ui/GlassCard'
import { ROUTES } from '@/app/router/routes'

export const GitHubOAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')
  const processedRef = useRef(false)

  const { mutate: loginWithGitHubCode, isPending, error } = useGitHubCodeLogin()

  useEffect(() => {
    if (processedRef.current) return

    if (errorParam) {
      processedRef.current = true
      toast.error('GitHub authorization rejected', {
        description: searchParams.get('error_description') || 'User denied access to GitHub account.',
      })
      navigate(ROUTES.AUTH.LOGIN, { replace: true })
      return
    }

    if (code) {
      processedRef.current = true
      toast.info('Authenticating GitHub session...', {
        description: 'Exchanging code and verifying email ownership via GitHub API...',
      })
      loginWithGitHubCode(code, {
        onSuccess: () => {
          toast.success('Successfully authenticated via GitHub OAuth2!', {
            description: 'Email identity confirmed by GitHub.',
          })
        },
        onError: (err) => {
          toast.error('GitHub OAuth2 authentication failed', {
            description: err.message || 'Unable to verify GitHub account credentials.',
          })
          navigate(ROUTES.AUTH.LOGIN, { replace: true })
        },
      })
    } else {
      processedRef.current = true
      navigate(ROUTES.AUTH.LOGIN, { replace: true })
    }
  }, [code, errorParam, searchParams, navigate, loginWithGitHubCode])

  return (
    <div className="w-full h-screen flex items-center justify-center p-4 bg-background text-foreground relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <GlassCard accentColor="purple" className="p-8 text-center space-y-5 rounded-2xl shadow-2xl border-border bg-card">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold font-serif text-foreground">
              Verifying GitHub Identity
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Exchanging authorization token and confirming email ownership with GitHub server API...
            </p>
          </div>

          {isPending && (
            <div className="py-4">
              <LoadingSpinner size="lg" label="Validating OAuth2 Token Signature..." />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error.message || 'Identity verification failed.'}</span>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default GitHubOAuthCallbackPage
