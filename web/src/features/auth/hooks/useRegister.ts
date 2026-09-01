import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/features/auth/api/authApi'
import { tokenStorage } from '@/lib/auth/tokenStorage'
import { useAuthStore } from '@/stores/useAuthStore'
import { queryClient } from '@/lib/query/queryClient'
import { queryKeys } from '@/lib/query/queryKeys'
import { ROUTES } from '@/app/router/routes'
import type { UserCreatePayload, User, TokenPair } from '@/types/api'
import type { APIError } from '@/lib/api/apiClient'

export function useRegister() {
  const navigate = useNavigate()

  return useMutation<User, APIError, UserCreatePayload>({
    mutationFn: async (payload: UserCreatePayload) => {
      /* 1. Register new user account on backend */
      const user = await authApi.register(payload)

      /* 2. Authenticate immediately to obtain JWT token pair */
      const tokenPair: TokenPair = await authApi.login({
        email: payload.email,
        password: payload.password,
      })

      /* 3. Persist access and refresh tokens */
      tokenStorage.setAccessToken(tokenPair.access_token)
      if (tokenPair.refresh_token) {
        tokenStorage.setRefreshToken(tokenPair.refresh_token)
      }

      return user
    },
    retry: false,
    onSuccess: async (registeredUser: User) => {
      try {
        /* 4. Fetch authenticated user profile */
        const profile: User = await authApi.getCurrentUser()

        /* 5. Populate global Zustand auth store */
        useAuthStore.getState().setUser({
          id: String(profile.id || registeredUser.id),
          email: profile.email || registeredUser.email,
          name: profile.name || registeredUser.name || undefined,
        })
        useAuthStore.getState().setAuthenticated(true)
        useAuthStore.getState().setInitialized(true)

        /* 6. Invalidate auth query cache */
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser })

        /* 7. Navigate to Application Dashboard */
        navigate(ROUTES.APP.DASHBOARD, { replace: true })
      } catch (profileError) {
        tokenStorage.clearTokens()
        useAuthStore.getState().clearAuth()
        throw profileError
      }
    },
  })
}

export default useRegister
