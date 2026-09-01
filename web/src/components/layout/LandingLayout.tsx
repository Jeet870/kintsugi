import React from 'react'
import { Outlet } from 'react-router-dom'
import { BackgroundEffects } from '@/components/background/BackgroundEffects'
import { LandingNavbar } from '@/features/onboarding/components/landing/LandingNavbar'
import { LandingFooter } from '@/features/onboarding/components/landing/LandingFooter'

export interface LandingLayoutProps {
  children?: React.ReactNode
}

export const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground relative selection:bg-violet-600 selection:text-white">
      {/* Persisted Animated Background */}
      <BackgroundEffects />

      {/* Fixed Glassmorphism Top Navigation Header */}
      <LandingNavbar />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 pt-20">
        {children || <Outlet />}
      </main>

      {/* Shared Footer */}
      <LandingFooter />
    </div>
  )
}

export default LandingLayout
