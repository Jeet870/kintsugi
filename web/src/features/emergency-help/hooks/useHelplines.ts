import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/queryKeys'
import { emergencyApi } from '../api/emergencyApi'
import type { HelplineResource } from '@/types/api'
import type { APIError } from '@/lib/api/apiClient'

export interface UseHelplinesOptions {
  countryCode?: string
  enabled?: boolean
  staleTime?: number
  gcTime?: number
}

/**
 * Custom React Query hook for fetching and caching country-specific emergency helplines.
 *
 * Single Source of Truth: Binds to `queryKeys.emergency.helplines(targetCountry)`.
 */
export function useHelplines(options?: UseHelplinesOptions) {
  const countryCode = (options?.countryCode ?? 'IN').trim().toUpperCase()

  return useQuery<HelplineResource[], APIError>({
    queryKey: queryKeys.emergency.helplines(countryCode),
    queryFn: () => emergencyApi.getHelplines(countryCode),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 1000 * 60 * 60 * 12, // 12 hours default
    gcTime: options?.gcTime ?? 1000 * 60 * 60 * 24, // 24 hours default
    placeholderData: (previousData) => previousData,
    retry: 3,
  })
}

export default useHelplines
