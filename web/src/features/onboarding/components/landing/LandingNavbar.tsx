import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { AppLogo } from '@/components/AppLogo'
import { ROUTES } from '@/app/router/routes'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLoadingStore } from '@/stores/useLoadingStore'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Menu, ArrowRight, Sparkles, MessageSquare, Cpu, HelpCircle, Layers, ShieldCheck } from 'lucide-react'
import { prefetchRoute } from '@/lib/router/prefetch'

export const LandingNavbar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const authenticated = useAuthStore((state) => state.authenticated)
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  /* Detect page scroll to adjust navbar blur & shadow */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /* Auto-close mobile sheet drawer when window expands to desktop size (>=768px) */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navLinks = [
    { label: 'Features', path: ROUTES.PUBLIC.FEATURES, hash: '#features', icon: Sparkles },
    { label: 'How It Works', path: ROUTES.PUBLIC.HOW_IT_WORKS, hash: '#how-it-works', icon: Layers },
    { label: 'AI Companion', path: ROUTES.PUBLIC.AI_COMPANION, hash: '#ai-companion', icon: MessageSquare },
    { label: 'Technology', path: ROUTES.PUBLIC.TECHNOLOGY, hash: '#technology', icon: Cpu },
    { label: 'Safety', path: ROUTES.PUBLIC.SAFETY, hash: '#safety', icon: ShieldCheck },
    { label: 'FAQ', path: ROUTES.PUBLIC.FAQ, hash: '#faq', icon: HelpCircle },
  ]

  const handleNavClick = (link: typeof navLinks[0]) => {
    if (location.pathname === ROUTES.PUBLIC.HOME) {
      const el = document.querySelector(link.hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        window.history.pushState(null, '', link.hash)
        return
      }
    }

    /* Trigger PageLoader immediately on navigation click */
    useLoadingStore.getState().show(`Loading ${link.label}...`)
    navigate(link.path)
  }

  const handleLogoClick = () => {
    if (location.pathname !== ROUTES.PUBLIC.HOME) {
      useLoadingStore.getState().show('Loading Kintsugi Home...')
    }
  }

  const handleCTA = () => {
    if (authenticated) {
      useLoadingStore.getState().show('Opening Dashboard...')
      navigate(ROUTES.APP.DASHBOARD)
    } else {
      useLoadingStore.getState().show('Loading Account Registration...')
      navigate(ROUTES.AUTH.REGISTER)
    }
  }

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 select-none ${
        isScrolled
          ? 'border-b border-border bg-background/90 backdrop-blur-2xl shadow-xl'
          : 'border-b border-border bg-background/75 backdrop-blur-xl'
      }`}
      initial={!shouldReduceMotion ? { y: -20, opacity: 0 } : undefined}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto h-16 sm:h-[72px] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo with Prefetching */}
        <Link
          to={ROUTES.PUBLIC.HOME}
          onClick={handleLogoClick}
          onMouseEnter={() => prefetchRoute(ROUTES.PUBLIC.HOME)}
          onFocus={() => prefetchRoute(ROUTES.PUBLIC.HOME)}
          className="flex items-center gap-2"
        >
          <AppLogo size={36} showText={true} />
        </Link>

        {/* Desktop Navigation Links with Hover Prefetching */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-muted-foreground">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (location.pathname === ROUTES.PUBLIC.HOME && location.hash === link.hash)

            return (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                onMouseEnter={() => prefetchRoute(link.path)}
                onFocus={() => prefetchRoute(link.path)}
                className={`relative py-1 transition-colors ${
                  isActive ? 'text-foreground font-semibold' : 'hover:text-foreground'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-[#D4AF37] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Action Buttons with Prefetching */}
        <div className="hidden md:flex items-center gap-4">
          {authenticated ? (
            <Button
              onClick={() => {
                useLoadingStore.getState().show('Opening Dashboard...')
                navigate(ROUTES.APP.DASHBOARD)
              }}
              onMouseEnter={() => prefetchRoute(ROUTES.APP.DASHBOARD)}
              onFocus={() => prefetchRoute(ROUTES.APP.DASHBOARD)}
              className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-5 font-semibold gap-2 shadow-lg shadow-violet-600/20 cursor-pointer"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Button>
          ) : (
            <>
              <Link
                to={ROUTES.AUTH.LOGIN}
                onClick={() => useLoadingStore.getState().show('Loading Sign In...')}
                onMouseEnter={() => prefetchRoute(ROUTES.AUTH.LOGIN)}
                onFocus={() => prefetchRoute(ROUTES.AUTH.LOGIN)}
              >
                <Button variant="ghost" className="text-foreground hover:bg-muted rounded-lg px-4 font-medium">
                  Log in
                </Button>
              </Link>
              <Button
                onClick={handleCTA}
                onMouseEnter={() => prefetchRoute(ROUTES.AUTH.REGISTER)}
                onFocus={() => prefetchRoute(ROUTES.AUTH.REGISTER)}
                className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-lg px-5 shadow-lg shadow-violet-600/25 gap-2 border border-violet-400/20 cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation Drawer Trigger */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted rounded-lg">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-full max-w-sm bg-card text-card-foreground border-l border-border p-6 flex flex-col justify-between shadow-2xl"
            >
              <SheetHeader className="text-left space-y-6">
                <SheetTitle className="flex items-center gap-2 pt-2 border-b border-zinc-900 pb-4">
                  <AppLogo size={36} showText={true} />
                </SheetTitle>

                <nav className="flex flex-col space-y-2">
                  {navLinks.map((link) => {
                    const IconComponent = link.icon
                    const isActive = location.pathname === link.path

                    return (
                      <button
                        key={link.label}
                        onClick={() => {
                          setIsOpen(false)
                          handleNavClick(link)
                        }}
                        onMouseEnter={() => prefetchRoute(link.path)}
                        onFocus={() => prefetchRoute(link.path)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all text-left ${
                          isActive
                            ? 'text-white bg-violet-600/20 border border-violet-500/30'
                            : 'text-zinc-300 hover:text-white hover:bg-zinc-900/80 border border-transparent hover:border-zinc-800'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span>{link.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </SheetHeader>

              {/* Bottom Mobile Action Buttons */}
              <div className="space-y-3 pt-6 border-t border-zinc-900">
                {authenticated ? (
                  <Button
                    onClick={() => {
                      setIsOpen(false)
                      useLoadingStore.getState().show('Opening Dashboard...')
                      navigate(ROUTES.APP.DASHBOARD)
                    }}
                    className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-semibold shadow-lg shadow-violet-600/25 gap-2"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <>
                    <Link
                      to={ROUTES.AUTH.LOGIN}
                      onClick={() => {
                        setIsOpen(false)
                        useLoadingStore.getState().show('Loading Sign In...')
                      }}
                      className="block w-full"
                    >
                      <Button variant="outline" className="w-full h-12 border-zinc-800 bg-zinc-900/60 text-zinc-200 hover:bg-zinc-900 hover:text-white rounded-lg font-semibold">
                        Log in
                      </Button>
                    </Link>
                    <Button
                      onClick={() => {
                        setIsOpen(false)
                        handleCTA()
                      }}
                      className="w-full h-12 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 hover:from-violet-500 hover:to-purple-500 text-white rounded-lg font-semibold shadow-lg shadow-violet-600/30 gap-2 border border-violet-400/20"
                    >
                      <span>Get Started Free</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}

export default LandingNavbar
