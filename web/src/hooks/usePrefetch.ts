import { useCallback } from 'react'
import { prefetchRoute } from '@/lib/router/prefetch'

/**
 * Custom hook delivering `onMouseEnter` and `onFocus` event handlers
 * to trigger intelligent route bundle and server query prefetching.
 */
export function usePrefetch(path: string) {
  const handlePrefetch = useCallback(() => {
    prefetchRoute(path)
  }, [path])

  return {
    onMouseEnter: handlePrefetch,
    onFocus: handlePrefetch,
  }
}

export default usePrefetch
