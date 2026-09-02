import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, KeyRound, ExternalLink, ArrowRight, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/features/auth/api/authApi'

interface OAuthModalProps {
  isOpen: boolean
  provider: 'google' | 'github' | null
  onClose: () => void
  onAuthenticateToken: (provider: string, token: string) => void
  isPending: boolean
}

function isValidClientId(id?: string): boolean {
  if (!id) return false
  if (id.includes('example') || id.startsWith('123456789') || id.trim() === '') return false
  return true
}

const DEFAULT_GOOGLE_CLIENT_ID = '628430533257-mhs7rn8r72ntrsnihbccp7lgbras2bpr.apps.googleusercontent.com'

export const OAuthModal: React.FC<OAuthModalProps> = ({
  isOpen,
  provider,
  onClose,
  onAuthenticateToken,
  isPending,
}) => {
  const [tokenInput, setTokenInput] = useState('')
  const [clientId, setClientId] = useState('')
  const [oauthConfig, setOauthConfig] = useState<{ google_client_id?: string; github_client_id?: string }>({})
  const [authMode, setAuthMode] = useState<'popup' | 'token'>('popup')
  const [gisLoaded, setGisLoaded] = useState(false)
  const googleBtnRef = useRef<HTMLDivElement>(null)

  // Fetch backend OAuth client configuration on mount
  useEffect(() => {
    if (isOpen) {
      authApi.getOAuthConfig()
        .then((config) => {
          setOauthConfig(config)
          const gId = config.google_client_id || import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID
          const ghId = config.github_client_id || import.meta.env.VITE_GITHUB_CLIENT_ID || ''
          
          if (provider === 'google') {
            setClientId(gId)
            setAuthMode('popup')
          } else if (provider === 'github') {
            setClientId(ghId)
            if (!isValidClientId(ghId)) {
              setAuthMode('token')
            } else {
              setAuthMode('popup')
            }
          }
        })
        .catch(() => {
          if (provider === 'google') {
            setClientId(DEFAULT_GOOGLE_CLIENT_ID)
            setAuthMode('popup')
          } else {
            setAuthMode('token')
          }
        })
    }
  }, [isOpen, provider])

  // Load Google Identity Services SDK when provider is google
  useEffect(() => {
    if (!isOpen || provider !== 'google') return

    const loadGis = async () => {
      if ((window as any).google?.accounts?.id) {
        setGisLoaded(true)
        return
      }
      try {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => setGisLoaded(true)
        document.body.appendChild(script)
      } catch (err) {
        console.error('Failed to load Google Identity Services SDK:', err)
      }
    }
    loadGis()
  }, [isOpen, provider])

  // Initialize Google Sign-In button only if a valid Google Client ID is configured
  useEffect(() => {
    if (!isOpen || provider !== 'google' || !gisLoaded || !googleBtnRef.current) return

    const activeClientId = clientId || oauthConfig.google_client_id || import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID
    if (!isValidClientId(activeClientId)) return

    try {
      const google = (window as any).google
      if (google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: activeClientId,
          callback: (response: any) => {
            if (response?.credential) {
              onAuthenticateToken('google', response.credential)
            }
          },
        })

        googleBtnRef.current.innerHTML = ''
        google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
          shape: 'pill',
        })
      }
    } catch (e) {
      console.warn('Google Identity Services initialization notice:', e)
    }
  }, [isOpen, provider, gisLoaded, clientId, oauthConfig.google_client_id, onAuthenticateToken])

  if (!isOpen || !provider) return null

  const isGoogle = provider === 'google'
  const title = isGoogle ? 'Authenticate with Google OAuth2' : 'Authenticate with GitHub OAuth2'

  const activeClientId = isGoogle
    ? (clientId || oauthConfig.google_client_id || import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID)
    : (clientId || oauthConfig.github_client_id || import.meta.env.VITE_GITHUB_CLIENT_ID || '')

  const hasValidClientId = isValidClientId(activeClientId)

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenInput.trim()) return
    onAuthenticateToken(provider, tokenInput.trim())
  }

  const handleGitHubRedirect = () => {
    if (hasValidClientId) {
      const redirectUri = `${window.location.origin}/oauth/callback/github`
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${activeClientId}&scope=user:email&redirect_uri=${encodeURIComponent(redirectUri)}`
    } else {
      setAuthMode('token')
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 text-left relative overflow-hidden"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 pr-6">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${isGoogle ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
              {isGoogle ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground font-serif">{title}</h3>
              <p className="text-xs text-muted-foreground leading-snug">
                Genuine OAuth2 email verification via official provider APIs.
              </p>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Backend verifies your token signature directly with {isGoogle ? 'Google' : 'GitHub'} servers to confirm email ownership.</span>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-muted p-1 gap-1 text-xs">
            <button
              type="button"
              onClick={() => setAuthMode('popup')}
              className={`flex-1 py-1.5 font-semibold rounded-lg transition-all ${authMode === 'popup' ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {isGoogle ? 'Google Sign-In Popup' : 'GitHub Authorization'}
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('token')}
              className={`flex-1 py-1.5 font-semibold rounded-lg transition-all ${authMode === 'token' ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              OAuth Token Verification
            </button>
          </div>

          {/* Main Auth Content */}
          {authMode === 'popup' ? (
            <div className="space-y-4 pt-1 flex flex-col items-center">
              {isGoogle ? (
                hasValidClientId ? (
                  <div className="w-full flex flex-col items-center space-y-3 py-3 border border-border/50 rounded-xl bg-background/50 p-4">
                    <p className="text-xs text-muted-foreground text-center">
                      Click below to authorize your Google email account in Google's secure popup window.
                    </p>
                    <div ref={googleBtnRef} className="min-h-[44px] flex items-center justify-center">
                      {!gisLoaded && <span className="text-xs text-muted-foreground">Loading Google Sign-In SDK...</span>}
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-3 py-3.5 px-4 border border-amber-500/30 rounded-xl bg-amber-500/10 text-amber-200 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-amber-400">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Google Client ID Not Configured</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-200/90">
                      To enable 1-click Google Sign-In popup in production, set <code className="bg-amber-900/50 px-1 py-0.5 rounded font-mono">GOOGLE_CLIENT_ID</code> in your backend <code className="bg-amber-900/50 px-1 py-0.5 rounded font-mono">.env</code> file.
                    </p>
                    <p className="text-[11px] leading-relaxed text-amber-200/90 font-medium">
                      👉 Switch to the <strong>OAuth Token Verification</strong> tab to test backend verification with any Google ID Token.
                    </p>
                  </div>
                )
              ) : (
                hasValidClientId ? (
                  <div className="w-full space-y-3 py-3 border border-border/50 rounded-xl bg-background/50 p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      Redirect to GitHub to authorize Kintsugi to verify your primary GitHub email account.
                    </p>
                    <Button
                      type="button"
                      onClick={handleGitHubRedirect}
                      disabled={isPending}
                      className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl gap-2 text-xs cursor-pointer"
                    >
                      <span>Authorize via GitHub.com</span>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full space-y-3 py-3.5 px-4 border border-amber-500/30 rounded-xl bg-amber-500/10 text-amber-200 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-amber-400">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>GitHub Client ID Not Configured</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-200/90">
                      To enable GitHub authorization redirect, set <code className="bg-amber-900/50 px-1 py-0.5 rounded font-mono">GITHUB_CLIENT_ID</code> in your backend <code className="bg-amber-900/50 px-1 py-0.5 rounded font-mono">.env</code> file.
                    </p>
                    <p className="text-[11px] leading-relaxed text-amber-200/90 font-medium">
                      👉 Switch to the <strong>OAuth Token Verification</strong> tab to test backend verification with a GitHub Access Token.
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <form onSubmit={handleManualTokenSubmit} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {isGoogle ? 'Google ID Token / Access Token' : 'GitHub OAuth / Access Token'}
                  </Label>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="password"
                    required
                    placeholder={isGoogle ? 'Paste Google ID Token (eyJhbGci...)' : 'Paste GitHub Access Token (ghp_...)'}
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="pl-10 h-11 bg-background border-border text-foreground rounded-xl text-xs sm:text-sm font-mono"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground pl-1">
                  The backend will query {isGoogle ? 'https://oauth2.googleapis.com/tokeninfo' : 'https://api.github.com/user'} to cryptographically verify your token and extract your verified email.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isPending}
                  className="flex-1 h-11 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !tokenInput.trim()}
                  className="flex-1 h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl gap-2 text-xs cursor-pointer"
                >
                  {isPending ? 'Verifying Token...' : 'Verify Token & Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}

          {/* Footer note */}
          <div className="text-[11px] text-center text-muted-foreground border-t border-border pt-3">
            <span>Security guarantee: Unverified email addresses or missing tokens are strictly rejected by the backend authentication service.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default OAuthModal
