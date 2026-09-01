import apiClient from '@/lib/api/apiClient'
import { ENDPOINTS } from '@/lib/api/endpoints'

export interface NotificationRecord {
  id: number | string
  user_id: number | string
  title: string
  message: string
  body?: string
  is_read: boolean
  read?: boolean
  category?: string
  created_at: string
}

export async function getNotifications(): Promise<NotificationRecord[]> {
  const response = await apiClient.get<NotificationRecord[]>(ENDPOINTS.NOTIFICATIONS.LIST)
  return response.data
}

export async function markNotificationRead(id: number | string): Promise<void> {
  await apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(String(id)))
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
}

export async function deleteNotification(id: number | string): Promise<void> {
  await apiClient.delete(ENDPOINTS.NOTIFICATIONS.DELETE(String(id)))
}

export async function clearAllNotifications(): Promise<void> {
  await apiClient.delete(ENDPOINTS.NOTIFICATIONS.CLEAR_ALL)
}

export const notificationApi = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
}

export default notificationApi
