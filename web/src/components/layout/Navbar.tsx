import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { AppLogo } from '@/components/AppLogo'
import { PhoneCall, Menu, X } from 'lucide-react'

export function Navbar() {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)

    // Check backend health
    fetch('http://localhost:8000/health/live')
      .then((res) => res.json())
      .then((data) => setBackendOnline(data.status === 'healthy'))
      .catch(() => setBackendOnline(false))

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Mood Check-in', path: '/app/mood' },
    { name: 'AI Companion', path: '/app/chat' },
    { name: 'Encrypted Journal', path: '/app/journal' },
    { name: 'Daily Motivation', path: '/app/motivation' },
    { name: 'Emergency Support', path: '/app/emergency' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#09090B]/85 backdrop-blur-md border-b border-[#3F3F46]/80 shadow-2xl shadow-purple-950/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <AppLogo size={44} showText={true} />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#7C3AED]/15 text-[#A855F7] border border-[#7C3AED]/30'
                      : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* Right Status & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Backend Health Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] border border-[#3F3F46] text-xs font-medium text-[#A1A1AA]">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendOnline === true
                    ? 'bg-[#22C55E] animate-pulse shadow-sm shadow-[#22C55E]/50'
                    : backendOnline === false
                    ? 'bg-[#EF4444]'
                    : 'bg-[#F59E0B]'
                }`}
              />
              <span>
                {backendOnline === true ? 'Backend Live' : backendOnline === false ? 'Offline Mode' : 'Connecting...'}
              </span>
            </div>

            <Link to="/app">
              <Button size="sm" className="bg-[#7C3AED] hover:bg-[#8B5CF6] text-white shadow-md shadow-[#7C3AED]/25">
                Launch App
              </Button>
            </Link>

            <Link to="/app/emergency">
              <Button size="sm" variant="destructive" className="gap-1.5 shadow-sm">
                <PhoneCall className="w-3.5 h-3.5" />
                Helplines
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/app">
              <Button size="xs" className="bg-[#7C3AED] hover:bg-[#8B5CF6] text-white text-xs">
                Launch
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#18181B]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-[#3F3F46] bg-[#09090B]/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-2"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-[#FAFAFA] hover:bg-[#18181B] rounded-xl"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-[#3F3F46] flex flex-col gap-2">
              <Link to="/app" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#7C3AED] hover:bg-[#8B5CF6] text-white">
                  Launch Companion App
                </Button>
              </Link>
              <Link to="/app/emergency" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="destructive" className="w-full gap-2">
                  <PhoneCall className="w-4 h-4" /> 24/7 Crisis Helplines
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
