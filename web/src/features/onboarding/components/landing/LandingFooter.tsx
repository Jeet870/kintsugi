import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppLogo } from '@/components/AppLogo'
import { ROUTES } from '@/app/router/routes'
import { useLoadingStore } from '@/stores/useLoadingStore'
import { prefetchRoute } from '@/lib/router/prefetch'

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleFooterNav = (path: string, message: string) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    useLoadingStore.getState().show(message)
    navigate(path)
  }

  return (
    <footer className="border-t border-border bg-card text-muted-foreground text-sm select-none relative z-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-5 gap-10 text-left">
        {/* Column 1: Brand Info */}
        <div className="md:col-span-2 space-y-4">
          <button
            onClick={() => handleFooterNav(ROUTES.PUBLIC.HOME, 'Loading Home...')}
            onMouseEnter={() => prefetchRoute(ROUTES.PUBLIC.HOME)}
            onFocus={() => prefetchRoute(ROUTES.PUBLIC.HOME)}
            className="inline-block text-left focus:outline-none"
          >
            <AppLogo size={36} showText={true} />
          </button>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
            Kintsugi is an AI-powered mental wellness and reflective self-care platform inspired by the ancient art of gold-repair seam restoration.
          </p>
        </div>

        {/* Column 2: Platform Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Platform</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => handleFooterNav(ROUTES.PUBLIC.FEATURES, 'Loading Features Ecosystem...')}
                onMouseEnter={() => prefetchRoute(ROUTES.PUBLIC.FEATURES)}
                onFocus={() => prefetchRoute(ROUTES.PUBLIC.FEATURES)}
                className="hover:text-amber-500 transition-colors text-left"
              >
                Features
              </button>
            </li>
            <li>
              <button
                onClick={() => handleFooterNav(ROUTES.PUBLIC.HOW_IT_WORKS, 'Loading Execution Pipeline...')}
                onMouseEnter={() => prefetchRoute(ROUTES.PUBLIC.HOW_IT_WORKS)}
                onFocus={() => prefetchRoute(ROUTES.PUBLIC.HOW_IT_WORKS)}
                className="hover:text-amber-500 transition-colors text-left"
              >
                How It Works
              </button>
            </li>
            <li>
              <button
                onClick={() => handleFooterNav(ROUTES.PUBLIC.AI_COMPANION, 'Initializing AI Empathy Engine...')}
                onMouseEnter={() => prefetchRoute(ROUTES.PUBLIC.AI_COMPANION)}
                onFocus={() => prefetchRoute(ROUTES.PUBLIC.AI_COMPANION)}
                className="hover:text-amber-500 transition-colors text-left"
              >
                AI Companion
              </button>
            </li>
            <li>
              <button
                onClick={() => handleFooterNav(ROUTES.PUBLIC.TECHNOLOGY, 'Loading Technology Architecture...')}
                onMouseEnter={() => prefetchRoute(ROUTES.PUBLIC.TECHNOLOGY)}
                onFocus={() => prefetchRoute(ROUTES.PUBLIC.TECHNOLOGY)}
                className="hover:text-amber-500 transition-colors text-left"
              >
                Technology
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Resources */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Resources</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => handleFooterNav(ROUTES.PUBLIC.FAQ, 'Loading Knowledge Base...')}
                onMouseEnter={() => prefetchRoute(ROUTES.PUBLIC.FAQ)}
                onFocus={() => prefetchRoute(ROUTES.PUBLIC.FAQ)}
                className="hover:text-amber-500 transition-colors text-left"
              >
                FAQ
              </button>
            </li>
            <li>
              <button
                onClick={() => handleFooterNav(ROUTES.PUBLIC.CRISIS_SUPPORT, 'Loading Crisis Support Center...')}
                onMouseEnter={() => prefetchRoute(ROUTES.PUBLIC.CRISIS_SUPPORT)}
                onFocus={() => prefetchRoute(ROUTES.PUBLIC.CRISIS_SUPPORT)}
                className="hover:text-amber-500 transition-colors text-left"
              >
                Crisis Support
              </button>
            </li>
            <li>
              <button
                onClick={() => handleFooterNav(ROUTES.PUBLIC.SAFETY, 'Loading Safety Architecture...')}
                onMouseEnter={() => prefetchRoute(ROUTES.PUBLIC.SAFETY)}
                onFocus={() => prefetchRoute(ROUTES.PUBLIC.SAFETY)}
                className="hover:text-amber-500 transition-colors text-left"
              >
                Safety Architecture
              </button>
            </li>
            <li>
              <button
                onClick={() => handleFooterNav(ROUTES.PUBLIC.ABOUT, 'Loading Kintsugi Story...')}
                onMouseEnter={() => prefetchRoute(ROUTES.PUBLIC.ABOUT)}
                onFocus={() => prefetchRoute(ROUTES.PUBLIC.ABOUT)}
                className="hover:text-amber-500 transition-colors text-left"
              >
                About Kintsugi
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Legal & Governance */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Legal & Governance</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => handleFooterNav(ROUTES.PUBLIC.PRIVACY_POLICY, 'Loading Privacy Policy...')}
                onMouseEnter={() => prefetchRoute(ROUTES.PUBLIC.PRIVACY_POLICY)}
                onFocus={() => prefetchRoute(ROUTES.PUBLIC.PRIVACY_POLICY)}
                className="hover:text-amber-500 transition-colors text-left"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => handleFooterNav(ROUTES.PUBLIC.TERMS, 'Loading Terms of Service...')}
                onMouseEnter={() => prefetchRoute(ROUTES.PUBLIC.TERMS)}
                onFocus={() => prefetchRoute(ROUTES.PUBLIC.TERMS)}
                className="hover:text-amber-500 transition-colors text-left"
              >
                Terms of Service
              </button>
            </li>
            <li>
              <button
                onClick={() => handleFooterNav(ROUTES.PUBLIC.MEDICAL_DISCLAIMER, 'Loading Medical Disclaimer...')}
                onMouseEnter={() => prefetchRoute(ROUTES.PUBLIC.MEDICAL_DISCLAIMER)}
                onFocus={() => prefetchRoute(ROUTES.PUBLIC.MEDICAL_DISCLAIMER)}
                className="hover:text-amber-500 transition-colors text-left"
              >
                Medical Disclaimer
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Kintsugi Mental Wellness Platform. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default LandingFooter
