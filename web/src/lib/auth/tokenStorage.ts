/**
 * tokenStorage — Production-grade Token Persistence & Storage Abstraction Module.
 *
 * Architectural & Security Design Rationale:
 *
 * 1. Why Storage is Abstracted:
 *    - Direct `localStorage` access throughout the application creates tight coupling to the
 *      browser environment and makes changing storage engines (e.g., migrating to HttpOnly
 *      Secure Cookies, Capacitor Secure Storage, or React Native Encrypted Storage) impossible
 *      without editing hundreds of files.
 *    - Encapsulating storage operations behind private `read()`, `write()`, and `remove()` methods
 *      ensures a single point of modification for all token persistence policies.
 *
 * 2. How Future Secure Storage Can Replace LocalStorage:
 *    - The public API returns synchronous strings/booleans or handles storage operations cleanly.
 *      To swap `localStorage` for another engine, only the private helper methods in this file
 *      need to be updated.
 *
 * 3. Why Direct localStorage Access is Prohibited Elsewhere:
 *    - Prevents accidental token logging, malformed key typos, unhandled quota exceptions in
 *      private browsing modes, and inconsistent token clearing across logouts.
 */

const ACCESS_TOKEN_KEY = 'kintsugi_access_token'
const REFRESH_TOKEN_KEY = 'kintsugi_refresh_token'

/* ─── Private Encapsulated Storage Helpers ─── */

function isStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readStorage(key: string): string | null {
  if (!isStorageAvailable()) return null
  try {
    const value = localStorage.getItem(key)
    return value ? value : null
  } catch (error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(`[TokenStorage] Failed to read key "${key}" from storage:`, error)
    }
    return null
  }
}

function writeStorage(key: string, value: string): void {
  if (!isStorageAvailable()) return
  try {
    localStorage.setItem(key, value)
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[TokenStorage] Stored key "${key}" successfully.`)
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(`[TokenStorage] Failed to write key "${key}" to storage (Quota or Security Error):`, error)
    }
  }
}

function removeStorage(key: string): void {
  if (!isStorageAvailable()) return
  try {
    localStorage.removeItem(key)
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[TokenStorage] Removed key "${key}" from storage.`)
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(`[TokenStorage] Failed to remove key "${key}" from storage:`, error)
    }
  }
}

/* ─── Public API ─── */

export const tokenStorage = {
  /**
   * Retrieve the stored access token.
   */
  getAccessToken(): string | null {
    return readStorage(ACCESS_TOKEN_KEY)
  },

  /**
   * Store the access token.
   */
  setAccessToken(token: string): void {
    if (!token) return
    writeStorage(ACCESS_TOKEN_KEY, token)
  },

  /**
   * Remove the stored access token.
   */
  removeAccessToken(): void {
    removeStorage(ACCESS_TOKEN_KEY)
  },

  /**
   * Retrieve the stored refresh token.
   */
  getRefreshToken(): string | null {
    return readStorage(REFRESH_TOKEN_KEY)
  },

  /**
   * Store the refresh token.
   */
  setRefreshToken(token: string): void {
    if (!token) return
    writeStorage(REFRESH_TOKEN_KEY, token)
  },

  /**
   * Remove the stored refresh token.
   */
  removeRefreshToken(): void {
    removeStorage(REFRESH_TOKEN_KEY)
  },

  /**
   * Clear all authentication tokens from storage (on logout or session expiration).
   */
  clearTokens(): void {
    removeStorage(ACCESS_TOKEN_KEY)
    removeStorage(REFRESH_TOKEN_KEY)
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[TokenStorage] Storage cleared — all authentication tokens removed.')
    }
  },

  /**
   * Check if an access token exists.
   */
  hasAccessToken(): boolean {
    return Boolean(this.getAccessToken())
  },

  /**
   * Check if a refresh token exists.
   */
  hasRefreshToken(): boolean {
    return Boolean(this.getRefreshToken())
  },
}

export default tokenStorage
