import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '@/features/auth/api/authApi'
import { tokenStorage } from '@/lib/auth/tokenStorage'
import { useAuthStore } from '@/stores/useAuthStore'
import { queryClient } from '@/lib/query/queryClient'
import { queryKeys } from '@/lib/query/queryKeys'
import { ROUTES } from '@/app/router/routes'
import type { UserLoginPayload, TokenPair, User } from '@/types/api'
import type { APIError } from '@/lib/api/apiClient'

export function useLogin() {
  const navigate = useNavigate()
  const location = useLocation()

  /* Extract target return location if redirected by ProtectedRoute */
  const fromLocation = (location.state as { from?: { pathname: string } })?.from?.pathname

  return useMutation<TokenPair, APIError, UserLoginPayload>({
    mutationFn: (payload: UserLoginPayload) => authApi.login(payload),
    retry: false,
    onSuccess: async (tokenPair: TokenPair) => {
      /* 1. Store JWT Access & Refresh Tokens */
      tokenStorage.setAccessToken(tokenPair.access_token)
      if (tokenPair.refresh_token) {
        tokenStorage.setRefreshToken(tokenPair.refresh_token)
      }

      try {
        /* 2. Fetch authenticated user profile */
        const user: User = await authApi.getCurrentUser()

        /* 3. Populate global Zustand auth store */
        useAuthStore.getState().setUser({
          id: String(user.id),
          email: user.email,
          name: user.name || undefined,
        })
        useAuthStore.getState().setAuthenticated(true)
        useAuthStore.getState().setInitialized(true)

        /* 4. Invalidate auth query cache */
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser })

        /* 5. Navigate to intended page or Dashboard */
        const targetPath = fromLocation || ROUTES.APP.DASHBOARD
        navigate(targetPath, { replace: true })
      } catch (profileError) {
        // If profile fetch fails after login, clear credentials cleanly
        tokenStorage.clearTokens()
        useAuthStore.getState().clearAuth()
        throw profileError
      }
    },
  })
}

export default useLogin
