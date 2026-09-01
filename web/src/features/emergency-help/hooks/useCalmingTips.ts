import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/queryKeys'
import { emergencyApi } from '../api/emergencyApi'
import type { CalmingTip } from '@/types/api'
import type { APIError } from '@/lib/api/apiClient'

export interface UseCalmingTipsOptions {
  enabled?: boolean
  staleTime?: number
  gcTime?: number
}

/**
 * Custom React Query hook for retrieving non-AI deterministic calming guidance and grounding exercises.
 *
 * Single Source of Truth: Binds to `queryKeys.emergency.calmingTips()`.
 */
export function useCalmingTips(options?: UseCalmingTipsOptions) {
  return useQuery<CalmingTip[], APIError>({
    queryKey: queryKeys.emergency.calmingTips,
    queryFn: () => emergencyApi.getCalmingTips(),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 1000 * 60 * 60 * 12, // 12 hours default
    gcTime: options?.gcTime ?? 1000 * 60 * 60 * 24, // 24 hours default
    placeholderData: (previousData) => previousData,
    retry: 2,
  })
}

export default useCalmingTips
