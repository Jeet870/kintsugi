import { QueryClient } from '@tanstack/react-query'

/**
 * Shared singleton QueryClient instance for Kintsugi Web Application.
 * Configured with enterprise performance defaults:
 * - 5-minute staleTime to eliminate duplicate API requests during user navigation.
 * - 15-minute gcTime to preserve garbage-collected query caches.
 * - Disabled refetchOnWindowFocus to prevent jarring background network refetches.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      networkMode: 'online',
      structuralSharing: true,
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
})

export default queryClient
