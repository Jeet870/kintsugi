import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi, type NotificationRecord } from '../api/notificationApi'
import type { APIError } from '@/lib/api/apiClient'

export function useNotifications() {
  return useQuery<NotificationRecord[], APIError>({
    queryKey: ['notifications'],
    queryFn: notificationApi.getNotifications,
    staleTime: 10 * 1000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation<void, APIError, number | string>({
    mutationFn: notificationApi.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation<void, APIError>({
    mutationFn: notificationApi.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  return useMutation<void, APIError, number | string>({
    mutationFn: notificationApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useClearAllNotifications() {
  const queryClient = useQueryClient()
  return useMutation<void, APIError>({
    mutationFn: notificationApi.clearAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
