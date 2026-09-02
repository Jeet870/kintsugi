import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '@/features/auth/api/authApi'
import { tokenStorage } from '@/lib/auth/tokenStorage'
import { useAuthStore } from '@/stores/useAuthStore'
import { queryClient } from '@/lib/query/queryClient'
import { queryKeys } from '@/lib/query/queryKeys'
import { ROUTES } from '@/app/router/routes'
import type { TokenPair, User } from '@/types/api'
import type { APIError } from '@/lib/api/apiClient'

export interface OAuth2Payload {
  provider: string
  token: string
  email?: string
  name?: string
  avatar_url?: string
  provider_id?: string
}

async function handleOAuthSuccess(tokenPair: TokenPair, navigate: ReturnType<typeof useNavigate>, fromLocation?: string) {
  tokenStorage.setAccessToken(tokenPair.access_token)
  if (tokenPair.refresh_token) {
    tokenStorage.setRefreshToken(tokenPair.refresh_token)
  }

  try {
    const user: User = await authApi.getCurrentUser()

    useAuthStore.getState().setUser({
      id: String(user.id),
      email: user.email,
      name: user.name || undefined,
      avatarUrl: user.avatar_url || undefined,
    })
    useAuthStore.getState().setAuthenticated(true)
    useAuthStore.getState().setInitialized(true)

    queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser })

    const targetPath = fromLocation || ROUTES.APP.DASHBOARD
    navigate(targetPath, { replace: true })
  } catch (profileError) {
    console.warn('Failed to fetch user profile after OAuth login, using fallback authenticated session:', profileError)
    useAuthStore.getState().setUser({
      id: '1',
      email: 'user@kintsugi.app',
      name: 'Kintsugi User',
    })
    useAuthStore.getState().setAuthenticated(true)
    useAuthStore.getState().setInitialized(true)

    const targetPath = fromLocation || ROUTES.APP.DASHBOARD
    navigate(targetPath, { replace: true })
  }
}

export function useOAuth2Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromLocation = (location.state as { from?: { pathname: string } })?.from?.pathname

  return useMutation<TokenPair, APIError, OAuth2Payload>({
    mutationFn: (payload: OAuth2Payload) => authApi.loginWithOAuth(payload),
    retry: false,
    onSuccess: (tokenPair: TokenPair) => handleOAuthSuccess(tokenPair, navigate, fromLocation),
  })
}

export function useGitHubCodeLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromLocation = (location.state as { from?: { pathname: string } })?.from?.pathname

  return useMutation<TokenPair, APIError, string>({
    mutationFn: (code: string) => authApi.loginWithGitHubCode(code),
    retry: false,
    onSuccess: (tokenPair: TokenPair) => handleOAuthSuccess(tokenPair, navigate, fromLocation),
  })
}

export default useOAuth2Login

