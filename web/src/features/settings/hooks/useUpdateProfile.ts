import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { queryKeys } from '@/lib/query/queryKeys'
import { settingsApi } from '../api/settingsApi'
import type { User, UserUpdatePayload } from '@/types/api'
import type { APIError } from '@/lib/api/apiClient'

export interface UseUpdateProfileOptions {
  onSuccess?: (user: User) => void
  onError?: (error: APIError) => void
}

/**
 * Custom React Query mutation hook for updating profile preferences and settings.
 *
 * Single Source of Truth: All profile settings modifications flow through this hook.
 * Automatically invalidates `queryKeys.profile.me()` on success to refresh backend state across the application.
 */
export function useUpdateProfile(options?: UseUpdateProfileOptions) {
  const queryClient = useQueryClient()

  return useMutation<User, APIError, UserUpdatePayload>({
    mutationFn: (payload: UserUpdatePayload) => settingsApi.updateProfile(payload),

    onSuccess: (updatedUser) => {
      /* Invalidate all profile and user queries to trigger automatic sync */
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.me() })
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })

      toast.success('Profile settings updated successfully')

      options?.onSuccess?.(updatedUser)
    },

    onError: (error) => {
      const errorMessage = error.message || 'Failed to update profile settings.'
      toast.error(errorMessage)

      options?.onError?.(error)
    },
  })
}

export default useUpdateProfile
