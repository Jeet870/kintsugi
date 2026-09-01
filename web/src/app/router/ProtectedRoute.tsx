import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { ROUTES } from '@/app/router/routes'
import { PageLoader } from '@/components/loading/PageLoader'

export interface ProtectedRouteProps {
  /** Optional custom child element, defaults to <Outlet /> */
  children?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = React.memo(
  ({ children }) => {
    const location = useLocation()
    const authenticated = useAuthStore((state) => state.authenticated)
    const initialized = useAuthStore((state) => state.initialized)
    const loading = useAuthStore((state) => state.loading)

    /* Wait for AuthProvider bootstrap initialization to complete */
    if (!initialized || loading) {
      return <PageLoader message="Checking your session..." />
    }

    /* Redirect unauthenticated users to login while preserving target location */
    if (!authenticated) {
      return (
        <Navigate
          to={ROUTES.AUTH.LOGIN}
          replace
          state={{ from: location }}
        />
      )
    }

    /* Authenticated access granted */
    return children ? <>{children}</> : <Outlet />
  },
)

ProtectedRoute.displayName = 'ProtectedRoute'

export default ProtectedRoute
