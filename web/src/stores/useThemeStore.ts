import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeStore {
  theme: ThemeMode
  resolvedTheme: 'light' | 'dark'

  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
  resetTheme: () => void
}

/**
 * useThemeStore — Zustand Visual Theme Store.
 *
 * Architecture & Design Rationale:
 *
 * 1. Why DOM Updates Are Delegated to ThemeProvider:
 *    - Store functions are pure state mutators and should remain testable and environment-agnostic.
 *      Directly calling `document.documentElement.classList` inside Zustand actions causes
 *      coupling, side effects during SSR/testing, and race conditions.
 *    - `ThemeProvider` observes `theme` changes reactively via `useEffect` and handles class toggling,
 *      system media query listeners, and DOM updates safely.
 *
 * 2. Why Persistence Is Isolated:
 *    - Uses Zustand's `persist` middleware with `partialize` to persist only the user's explicit
 *      `theme` preference to `localStorage` under key `kintsugi-theme`.
 *
 * 3. How Future Themes Can Be Added:
 *    - Expand the `ThemeMode` union (e.g. `'purple' | 'zinc' | 'high-contrast'`).
 *    - Add matching CSS root class handlers in `ThemeProvider.tsx`.
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      resolvedTheme: 'dark',

      toggleTheme: () => {
        const current = get().theme
        const nextTheme: ThemeMode = current === 'dark' ? 'light' : 'dark'
        set({
          theme: nextTheme,
          resolvedTheme: nextTheme,
        })
      },

      setTheme: (theme: ThemeMode) => {
        const validTheme: ThemeMode =
          theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'dark'
        set({
          theme: validTheme,
          resolvedTheme: validTheme === 'system' ? 'dark' : validTheme,
        })
      },

      resetTheme: () =>
        set({
          theme: 'dark',
          resolvedTheme: 'dark',
        }),
    }),
    {
      name: 'kintsugi-theme',
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)
