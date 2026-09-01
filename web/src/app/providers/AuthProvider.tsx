import React, { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { tokenStorage } from '@/lib/auth/tokenStorage'
import { authApi } from '@/features/auth/api/authApi'
import { AppSplash } from '@/components/feedback/AppSplash'

export interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * AuthProvider — Root Authentication Lifecycle Manager.
 *
 * Restores user session on initial app load, validates stored JWT tokens against backend (/users/me),
 * and guarantees initialized state is set cleanly without deadlocks under React 18 StrictMode.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const initialized = useAuthStore((state) => state.initialized)
  const setUser = useAuthStore((state) => state.setUser)
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const setInitialized = useAuthStore((state) => state.setInitialized)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  useEffect(() => {
    let isCancelled = false

    async function bootstrapAuth() {
      const token = tokenStorage.getAccessToken()

      if (!token) {
        if (!isCancelled) {
          clearAuth()
        }
        return
      }

      try {
        const user = await authApi.getCurrentUser()
        if (isCancelled) return

        setUser({
          id: String(user.id),
          email: user.email,
          name: user.name || undefined,
        })
        setAuthenticated(true)
        setInitialized(true)
      } catch (error) {
        if (isCancelled) return

        // Clear invalid tokens and mark session initialized as unauthenticated
        tokenStorage.clearTokens()
        clearAuth()
      }
    }

    bootstrapAuth()

    return () => {
      isCancelled = true
    }
  }, [setUser, setAuthenticated, setInitialized, clearAuth])

  if (!initialized) {
    return <AppSplash />
  }

  return <>{children}</>
}

export default AuthProvider
