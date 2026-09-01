import React from 'react'
import { AppLogo } from '@/components/AppLogo'
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner'

export const AppSplash: React.FC = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Initializing application..."
      className="fixed inset-0 flex flex-col items-center justify-center bg-background text-foreground z-50 space-y-6 select-none"
    >
      <AppLogo size={56} showText={true} />
      <LoadingSpinner size="md" label="Restoring session..." />
    </div>
  )
}

export default AppSplash
