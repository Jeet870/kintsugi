import React, { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { AppLogo } from '@/components/AppLogo'
import { ROUTES } from '@/app/router/routes'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  LayoutDashboard,
  Heart,
  MessageSquare,
  BookOpen,
  User,
  Bell,
  Settings,
  Wind,
  Gamepad2,
  Sparkles,
  LifeBuoy,
  Info,
} from 'lucide-react'

/* ─── Navigation Item Contract ─── */
interface NavItem {
  readonly id: string
  readonly label: string
  readonly to: string
  readonly icon: React.ComponentType<{ className?: string }>
  readonly badgeKey?: 'notifications'
}

interface NavSection {
  readonly title: string
  readonly items: readonly NavItem[]
}

const NAV_SECTIONS: readonly NavSection[] = [
  {
    title: 'Core Features',
    items: [
      { id: 'dashboard', label: 'Home', to: ROUTES.APP.DASHBOARD, icon: LayoutDashboard },
      { id: 'mood', label: 'Mood Tracker', to: ROUTES.MOOD.TRACKER, icon: Heart },
      { id: 'chat', label: 'AI Companion', to: ROUTES.CHAT.COMPANION, icon: MessageSquare },
      { id: 'journal', label: 'Journal', to: ROUTES.JOURNAL.LIST, icon: BookOpen },
    ],
  },
  {
    title: 'Wellness & Mindfulness',
    items: [
      { id: 'breathing', label: 'Breathing Exercise', to: ROUTES.WELLNESS.BREATHING, icon: Wind },
      { id: 'mind-game', label: 'Mind Game', to: ROUTES.WELLNESS.MIND_GAME, icon: Gamepad2 },
      { id: 'motivation', label: 'Daily Motivation', to: ROUTES.WELLNESS.MOTIVATION, icon: Sparkles },
      { id: 'emergency', label: 'Emergency Help', to: ROUTES.EMERGENCY.HELP, icon: LifeBuoy },
    ],
  },
  {
    title: 'Account & Platform',
    items: [
      { id: 'notifications', label: 'Alerts', to: ROUTES.USER.NOTIFICATIONS, icon: Bell, badgeKey: 'notifications' },
      { id: 'profile', label: 'Profile', to: ROUTES.USER.PROFILE, icon: User },
      { id: 'settings', label: 'Settings', to: ROUTES.USER.SETTINGS, icon: Settings },
      { id: 'about', label: 'About Kintsugi', to: ROUTES.PUBLIC.ABOUT, icon: Info },
    ],
  },
] as const

const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((sec) => sec.items)

/* ─── Badge Formatter ─── */
function formatBadgeCount(count: number): string {
  if (count <= 0) return ''
  return count > 99 ? '99+' : `${count}`
}

export const NavigationBar: React.FC = React.memo(() => {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  /* Store subscriptions using selectors */
  const unreadCount = useNotificationStore((state) => state.unreadCount ?? 0)
  const user = useAuthStore((state) => state.user)

  const formattedBadge = useMemo(() => formatBadgeCount(unreadCount), [unreadCount])

  return (
    <>
      {/* ── Desktop Left Sidebar (w-[280px]) ── */}
      <aside
        aria-label="Application Primary Sidebar"
        className="hidden md:flex flex-col w-[280px] h-screen sticky top-0 border-r border-[#3F3F46] bg-[#09090B]/90 backdrop-blur-xl z-30 shrink-0 select-none"
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#3F3F46]/60 flex items-center justify-between">
          <AppLogo size={36} showText={true} />
        </div>

        {/* Categorized Navigation List */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-thin scrollbar-thumb-zinc-800">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              <h5 className="px-3 pb-1.5 text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-500">
                {section.title}
              </h5>
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.to === ROUTES.APP.DASHBOARD
                    ? location.pathname === ROUTES.APP.DASHBOARD
                    : location.pathname.startsWith(item.to)

                return (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    aria-current={isActive ? 'page' : undefined}
                    className="relative block"
                  >
                    <motion.div
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        isActive ? 'text-[#FAFAFA]' : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-zinc-900/50'
                      }`}
                      whileHover={isAnimated ? { scale: 1.02, x: 2 } : undefined}
                      whileTap={isAnimated ? { scale: 0.98 } : undefined}
                    >
                      {/* Active Background Pill */}
                      {isActive && (
                        <motion.div
                          layoutId="desktop-active-pill"
                          className="absolute inset-0 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/50 shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}

                      {/* Icon */}
                      <div className="relative z-10">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#FFD166]' : 'text-[#A855F7]'}`} />
                      </div>

                      {/* Label */}
                      <span className="relative z-10 font-medium tracking-tight flex-1">{item.label}</span>

                      {/* Notification Badge */}
                      {item.badgeKey === 'notifications' && formattedBadge && (
                        <AnimatePresence>
                          <motion.span
                            key="desktop-badge"
                            initial={isAnimated ? { scale: 0, opacity: 0 } : undefined}
                            animate={isAnimated ? { scale: 1, opacity: 1 } : undefined}
                            exit={isAnimated ? { scale: 0, opacity: 0 } : undefined}
                            className="relative z-10 px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#EF4444] text-white shadow-sm"
                          >
                            {formattedBadge}
                          </motion.span>
                        </AnimatePresence>
                      )}
                    </motion.div>
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Desktop User Footer */}
        {user && (
          <div className="p-4 border-t border-[#3F3F46]/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300">
              {user.name ? user.name[0]?.toUpperCase() : user.email[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-100 truncate">{user.name || 'User'}</p>
              <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </aside>

      {/* ── Mobile Floating Bottom Bar (h-20) ── */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-3 left-4 right-4 h-20 bg-[#09090B]/95 backdrop-blur-xl border border-[#3F3F46] rounded-3xl z-40 flex items-center justify-start overflow-x-auto gap-2 px-4 shadow-2xl pb-safe select-none scrollbar-none"
      >
        {ALL_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            item.to === ROUTES.APP.DASHBOARD
              ? location.pathname === ROUTES.APP.DASHBOARD
              : location.pathname.startsWith(item.to)

          return (
            <NavLink
              key={item.id}
              to={item.to}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] p-1.5"
            >
              <motion.div
                className="relative flex flex-col items-center justify-center gap-1"
                whileHover={isAnimated ? { scale: 1.08 } : undefined}
                whileTap={isAnimated ? { scale: 0.92 } : undefined}
              >
                {/* Mobile Active Pill */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-pill"
                    className="absolute -inset-2 rounded-2xl bg-[#7C3AED]/25 border border-[#7C3AED]/40 shadow-[0_0_12px_rgba(124,58,237,0.3)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}

                {/* Icon with notification dot */}
                <div className="relative z-10">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'text-[#FFD166] scale-110' : 'text-[#A855F7]'}`} />
                  {item.badgeKey === 'notifications' && formattedBadge && (
                    <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 text-[10px] font-bold rounded-full bg-[#EF4444] text-white flex items-center justify-center">
                      {formattedBadge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`relative z-10 text-[10px] font-medium leading-none transition-colors ${
                    isActive ? 'text-[#FAFAFA]' : 'text-[#A1A1AA]'
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </NavLink>
          )
        })}
      </nav>
    </>
  )
})

NavigationBar.displayName = 'NavigationBar'

export default NavigationBar
