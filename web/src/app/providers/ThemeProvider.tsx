import React, { useEffect } from 'react'
import { useThemeStore, type ThemeMode } from '@/stores/useThemeStore'

export interface ThemeProviderProps {
  children: React.ReactNode
}

const KNOWN_THEME_CLASSES = ['light', 'dark'] as const

function resolveTheme(theme: ThemeMode): 'dark' | 'light' {
  if (theme === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'dark'
  }
  return theme
}

function applyThemeToElement(resolvedTheme: 'dark' | 'light'): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.classList.remove(...KNOWN_THEME_CLASSES)
  root.classList.add(resolvedTheme)
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    const resolvedTheme = resolveTheme(theme)
    applyThemeToElement(resolvedTheme)

    if (theme !== 'system' || typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      applyThemeToElement(e.matches ? 'dark' : 'light')
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else if ('addListener' in mediaQuery) {
      // Fallback for older browsers
      ;(mediaQuery as MediaQueryList).addListener(handleChange)
      return () => (mediaQuery as MediaQueryList).removeListener(handleChange)
    }
  }, [theme])

  return <>{children}</>
}

export default ThemeProvider
