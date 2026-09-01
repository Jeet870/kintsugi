import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * UserProfile — Public non-sensitive user metadata model.
 * Tokens, password hashes, and sensitive session data are strictly excluded.
 */
export interface UserProfile {
  id: string
  uuid?: string
  name?: string
  email: string
  avatarUrl?: string
  avatar_url?: string
  themePreference?: 'light' | 'dark' | 'system'
  notificationEnabled?: boolean
  isActive?: boolean
}

export interface AuthState {
  user: UserProfile | null
  authenticated: boolean
  loading: boolean
  isLoading: boolean
  initialized: boolean

  setUser: (user: UserProfile | null) => void
  updateUser: (partialUser: Partial<UserProfile>) => void
  clearUser: () => void
  clearAuth: () => void
  setAuthenticated: (authenticated: boolean) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
}

/**
 * useAuthStore — Single Source of Truth for Global Authentication State.
 *
 * Architectural Rationale:
 *
 * 1. Why Tokens Are Excluded:
 *    - JWT access and refresh tokens are sensitive credentials managed exclusively by
 *      `src/lib/auth/tokenStorage.ts`. Keeping tokens out of Zustand prevents accidental
 *      state inspection exposure, logging, or serialization vulnerabilities.
 *
 * 2. Why Persistence is Minimalized via Partialize:
 *    - `partialize` restricts `localStorage` persistence to non-sensitive UI fields
 *      (`user.id`, `user.uuid`, `user.name`, `user.avatarUrl`).
 *    - Reduces storage overhead and avoids persisting stale security flags or loading states.
 *
 * 3. Why API & Auth Logic Belongs in Providers/Services:
 *    - Stores represent state containers, not execution layers. Asynchronous session restoration
 *      and backend validation (`GET /users/me`) belong strictly in `AuthProvider` and `authApi`.
 *
 * 4. Expected Lifecycle with AuthProvider:
 *    - On mount, `AuthProvider` checks `tokenStorage`.
 *    - If token exists, `AuthProvider` fetches `/users/me` and calls `setUser(user)`.
 *    - If invalid or absent, `AuthProvider` calls `clearAuth()`.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      authenticated: false,
      loading: true,
      isLoading: true,
      initialized: false,

      setUser: (user) =>
        set({
          user,
          authenticated: user !== null,
          loading: false,
          isLoading: false,
        }),

      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null,
        })),

      clearUser: () =>
        set({
          user: null,
          authenticated: false,
          loading: false,
          isLoading: false,
          initialized: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          authenticated: false,
          loading: false,
          isLoading: false,
          initialized: true,
        }),

      setAuthenticated: (authenticated) => set({ authenticated }),

      setLoading: (loading) => set({ loading, isLoading: loading }),

      setInitialized: (initialized) => set({ initialized, loading: false, isLoading: false }),
    }),
    {
      name: 'kintsugi_auth_state',
      partialize: (state) => ({
        user: state.user
          ? {
              id: state.user.id,
              uuid: state.user.uuid,
              name: state.user.name,
              avatarUrl: state.user.avatarUrl || state.user.avatar_url,
            }
          : null,
      }),
    },
  ),
)
