import React from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { AnimatedBackground } from '@/components/animated/AnimatedBackground'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight, PhoneCall, Sparkles, Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/stores/useThemeStore'

export interface AppShellProps {
  /** Optional custom child element, defaults to <Outlet /> */
  children?: React.ReactNode
  /** Optional active tab parameter for breadcrumbs / header slot */
  currentTab?: string
}

/* Map route path to breadcrumb category and page titles */
function getBreadcrumbPath(pathname: string) {
  if (pathname.includes('/app/mood') || pathname.includes('/mood')) {
    return { category: 'Wellness', page: 'Mood Tracker' }
  }
  if (pathname.includes('/app/chat')) {
    return { category: 'AI Suite', page: 'Companion Chat' }
  }
  if (pathname.includes('/app/journal')) {
    return { category: 'Privacy Vault', page: 'Journal' }
  }
  if (pathname.includes('/app/motivation')) {
    return { category: 'Growth', page: 'Daily Motivation' }
  }
  if (pathname.includes('/app/emergency')) {
    return { category: 'Safety', page: 'Emergency Helplines' }
  }
  if (pathname.includes('/app/profile') || pathname.includes('/app/settings')) {
    return { category: 'Account', page: 'Settings' }
  }
  return { category: 'Dashboard', page: 'Overview' }
}

export const AppShell: React.FC<AppShellProps> = React.memo(({ children }) => {
  const location = useLocation()
  const breadcrumb = getBreadcrumbPath(location.pathname)
  const isChat = location.pathname.includes('/app/chat')
  const { theme, toggleTheme } = useThemeStore()

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className={`min-h-screen flex w-full bg-background text-foreground relative font-sans selection:bg-[#7C3AED] selection:text-white overflow-x-clip transition-colors duration-250 ${isChat ? 'h-screen overflow-hidden' : ''}`}>
          {/* ── Layer 1: Fixed Global Animated Background ── */}
          <AnimatedBackground />

          {/* ── Layer 2: Primary App Sidebar Component ── */}
          <AppSidebar />

          {/* ── Layer 3: Main Routed Content Container ── */}
          <SidebarInset className={`flex-1 flex flex-col relative z-10 bg-transparent ${isChat ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
            {/* Sticky Top Navigation Bar — stays pinned on scroll within SidebarInset */}
            <header className="sticky top-0 h-14 shrink-0 flex items-center justify-between border-b border-border px-4 sm:px-6 bg-background/85 backdrop-blur-2xl z-30 shadow-sm transition-colors duration-250">
              {/* Left Side: Sidebar Toggle + Breadcrumbs */}
              <div className="flex items-center gap-3 overflow-hidden shrink-0">
                <SidebarTrigger className="size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center cursor-pointer shrink-0 transition-colors" />

                <Separator orientation="vertical" className="h-4 bg-border" />

                {/* Minimal Breadcrumb */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-hidden">
                  <Link
                    to="/app/mood"
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors font-medium shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" />
                    <span className="hidden sm:inline">Kintsugi</span>
                  </Link>

                  <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />

                  <span className="text-muted-foreground hidden lg:inline truncate">{breadcrumb.category}</span>

                  <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0 hidden lg:inline" />

                  <span className="font-semibold text-foreground truncate">{breadcrumb.page}</span>
                </nav>
              </div>

              {/* Right Side: Safety Status Badge + Theme Toggle + Quick Helpline Action */}
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                <Badge
                  variant="outline"
                  className="hidden md:flex items-center gap-1.5 bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Protected</span>
                </Badge>

                {/* Theme Toggle Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="w-8 h-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label="Toggle visual theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-violet-600" />
                  )}
                </Button>

                <Link
                  to="/app/emergency"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold transition-all cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Helpline</span>
                </Link>
              </div>
            </header>

            <div className={`flex-1 w-full ${isChat ? 'h-[calc(100vh-3.5rem)] overflow-hidden p-0' : 'p-4 sm:p-6 lg:p-8'}`}>
              {children ? children : <Outlet />}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
})

AppShell.displayName = 'AppShell'

export default AppShell
