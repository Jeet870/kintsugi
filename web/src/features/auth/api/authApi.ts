import apiClient from '@/lib/api/apiClient'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { User, TokenPair, UserCreatePayload, UserLoginPayload } from '@/types/api'

/**
 * authApi — Production API module for authentication and session management.
 * Communicates exclusively through the shared Axios client and endpoint dictionary.
 * No mock responses, fake users, or local authentication logic.
 */
export const authApi = {
  /**
   * Register a new user account with validated credentials.
   * Calls POST /api/v1/auth/register
   */
  async register(payload: UserCreatePayload, signal?: AbortSignal): Promise<User> {
    const response = await apiClient.post<User>(ENDPOINTS.AUTH.REGISTER, payload, { signal })
    return response.data
  },

  /**
   * Authenticate user credentials and return JWT access and refresh token pair.
   * Calls POST /api/v1/auth/login using OAuth2 form-encoded payload (username=email, password=password)
   */
  async login(payload: UserLoginPayload, signal?: AbortSignal): Promise<TokenPair> {
    const params = new URLSearchParams()
    params.append('username', payload.email.trim().toLowerCase())
    params.append('password', payload.password)

    const response = await apiClient.post<TokenPair>(ENDPOINTS.AUTH.LOGIN, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      signal,
    })

    return response.data
  },

  /**
   * Retrieve public OAuth client configuration from backend.
   * Calls GET /api/v1/auth/oauth/config
   */
  async getOAuthConfig(signal?: AbortSignal): Promise<{ google_client_id: string; github_client_id: string }> {
    const response = await apiClient.get<{ google_client_id: string; github_client_id: string }>(
      ENDPOINTS.AUTH.OAUTH_CONFIG,
      { signal }
    )
    return response.data
  },

  /**
   * Authenticate user via OAuth2 provider (Google ID token or GitHub Access token).
   * Calls POST /api/v1/auth/oauth/login with mandatory token verification
   */
  async loginWithOAuth(
    payload: { provider: string; token: string; email?: string; name?: string; avatar_url?: string; provider_id?: string },
    signal?: AbortSignal
  ): Promise<TokenPair> {
    const response = await apiClient.post<TokenPair>(ENDPOINTS.AUTH.OAUTH_LOGIN, payload, { signal })
    return response.data
  },

  /**
   * Exchange GitHub OAuth authorization code for verified user session.
   * Calls POST /api/v1/auth/oauth/github/code
   */
  async loginWithGitHubCode(code: string, signal?: AbortSignal): Promise<TokenPair> {
    const response = await apiClient.post<TokenPair>(
      ENDPOINTS.AUTH.OAUTH_GITHUB_CODE,
      { code },
      { signal }
    )
    return response.data
  },


  /**
   * Rotate refresh token and issue a fresh access/refresh token pair.
   * Calls POST /api/v1/auth/refresh
   */
  async refresh(refreshToken: string, signal?: AbortSignal): Promise<TokenPair> {
    const response = await apiClient.post<TokenPair>(
      ENDPOINTS.AUTH.REFRESH,
      { refresh_token: refreshToken },
      { signal },
    )
    return response.data
  },

  /**
   * Revoke active session refresh token on the backend.
   * Calls POST /api/v1/auth/logout
   */
  async logout(refreshToken?: string | null, signal?: AbortSignal): Promise<void> {
    if (!refreshToken) return
    try {
      await apiClient.post(
        ENDPOINTS.AUTH.LOGOUT,
        { refresh_token: refreshToken },
        { signal },
      )
    } catch {
      // Ignore logout cleanup errors on backend
    }
  },

  /**
   * Retrieve the current authenticated user profile.
   * Calls GET /api/v1/users/me
   */
  async getCurrentUser(signal?: AbortSignal): Promise<User> {
    const response = await apiClient.get<User>(ENDPOINTS.USERS.ME, { signal })
    return response.data
  },
}

export default authApi
