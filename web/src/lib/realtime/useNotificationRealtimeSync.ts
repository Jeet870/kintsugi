import { useEffect } from 'react'
import { socket } from './socket'
import { useNotificationStore } from '@/stores/useNotificationStore'
import type { NotificationNewPayload } from './realtimeEvents'

/**
 * useNotificationRealtimeSync — Global Realtime Notification Badge Sync Hook.
 *
 * Architecture & Design Rationale:
 *
 * 1. Why Notifications Bypass TanStack Query:
 *    - The unread notification badge count is top-level global UI state (rendered in headers,
 *      sidebars, and mobile bars).
 *    - Invalidating or refetching queries over HTTP for a simple unread count increment adds
 *      unnecessary latency, server load, and component re-renders.
 *    - Updating Zustand directly provides instant, O(1) synchronous badge increments.
 *
 * 2. Why Zustand is Used for Badge State:
 *    - Zustand provides lightweight, atomic, selector-based state subscriptions without context
 *      re-render cascades. Components like `NavigationBar` can subscribe exclusively to
 *      `unreadCount` without re-rendering when other state changes.
 *
 * 3. Why This Hook Is Mounted Once Globally in RealtimeProvider:
 *    - Centralizing the realtime notification listener inside `RealtimeProvider` ensures that
 *      notification events are captured regardless of which page the user is currently viewing.
 *    - Mounting once prevents multiple feature screens from registering duplicate listeners.
 *
 * 4. Duplicate Subscription Prevention:
 *    - `useEffect` cleanup automatically invokes `socket.unsubscribe("notification.new", handler)`
 *      on unmount, guaranteeing zero listener leaks or duplicate calls.
 */
export function useNotificationRealtimeSync(): void {
  const addNotification = useNotificationStore((state) => state.addNotification)

  useEffect(() => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[Realtime Notification] Subscribed to notification.new channel')
    }

    const unsubscribe = socket.subscribe('notification.new', (data: unknown) => {
      if (!data || typeof data !== 'object') {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error('[Realtime Notification] Invalid notification payload received:', data)
        }
        return
      }

      const raw = data as Partial<NotificationNewPayload> | { notification?: NotificationNewPayload['notification'] }
      const notifData = 'notification' in raw && raw.notification ? raw.notification : (raw as NotificationNewPayload['notification'])

      if (!notifData || !notifData.title || !notifData.message) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error('[Realtime Notification] Malformed notification structure:', data)
        }
        return
      }

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('[Realtime Notification] Notification received:', notifData.title)
      }

      addNotification({
        id: notifData.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: notifData.title,
        message: notifData.message,
        read: notifData.read ?? false,
        createdAt: notifData.createdAt || new Date().toISOString(),
      })

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('[Realtime Notification] Unread count incremented & notification added to store')
      }
    })

    return () => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('[Realtime Notification] Unsubscribed from notification.new channel')
      }
      unsubscribe()
    }
  }, [addNotification])
}

export default useNotificationRealtimeSync
