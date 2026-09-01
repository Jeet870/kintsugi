import { create } from 'zustand'

export interface NotificationSummary {
  id: string
  title: string
  message: string
  read?: boolean
  isRead?: boolean
  createdAt: string
  category?: string
  type?: string
}

/* Alias for backward compatibility across components */
export type AppNotification = NotificationSummary

export interface NotificationState {
  unreadCount: number
  notifications: NotificationSummary[]
  lastReceivedAt: string | null

  /* Actions */
  incrementUnread: () => void
  decrementUnread: () => void
  resetUnread: () => void
  setUnreadCount: (count: number) => void

  addNotification: (notification: NotificationSummary) => void
  markNotificationRead: (id: string) => void
  markAsRead: (id: string) => void
  markAllRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  clearAll: () => void
  reset: () => void
}

/**
 * useNotificationStore — Single Source of Truth for Realtime Notification UI State.
 *
 * Architecture & Design Rationale:
 *
 * 1. Why Notification State Is Separated from TanStack Query:
 *    - The unread badge count is a top-level global UI indicator rendered synchronously on navigation elements.
 *    - Triggering full HTTP query refetches for every incoming realtime badge update introduces network overhead,
 *      loading state flickering, and unnecessary component re-render cascades.
 *    - Zustand provides instant, $O(1)$ atomic state updates.
 *
 * 2. Why Realtime Updates Modify the Store Directly:
 *    - WebSocket events (`notification.new`) push lightweight payloads directly to `useNotificationRealtimeSync`.
 *      Modifying Zustand immediately reflects in the header/sidebar notification badge with zero latency.
 *
 * 3. Why Unread Count Is Maintained Independently of API Responses:
 *    - Allows optimistic badge updates (incrementing on incoming WS frame, decrementing on click) without waiting
 *      for backend roundtrips.
 *
 * 4. How Future Notification Synchronization Can Be Added:
 *    - If historical notification pagination is required in a notification drawer, TanStack Query can fetch
 *      `queryKeys.notifications.list()`, while this store continues managing the live unread badge count.
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  notifications: [],
  lastReceivedAt: null,

  incrementUnread: () =>
    set((state) => ({
      unreadCount: state.unreadCount + 1,
    })),

  decrementUnread: () =>
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  resetUnread: () => set({ unreadCount: 0 }),

  setUnreadCount: (count) =>
    set({ unreadCount: Math.max(0, count) }),

  addNotification: (notification) =>
    set((state) => {
      // Prevent duplicate notification IDs
      if (state.notifications.some((n) => n.id === notification.id)) {
        return state
      }

      const isRead = notification.read ?? notification.isRead ?? false
      const formatted: NotificationSummary = {
        ...notification,
        read: isRead,
        isRead,
      }

      return {
        notifications: [formatted, ...state.notifications],
        unreadCount: isRead ? state.unreadCount : state.unreadCount + 1,
        lastReceivedAt: notification.createdAt || new Date().toISOString(),
      }
    }),

  markNotificationRead: (id) =>
    set((state) => {
      let targetWasUnread = false
      const updated = state.notifications.map((n) => {
        if (n.id === id) {
          if (!n.read && !n.isRead) targetWasUnread = true
          return { ...n, read: true, isRead: true }
        }
        return n
      })

      return {
        notifications: updated,
        unreadCount: targetWasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      }
    }),

  markAsRead: (id) =>
    set((state) => {
      let targetWasUnread = false
      const updated = state.notifications.map((n) => {
        if (n.id === id) {
          if (!n.read && !n.isRead) targetWasUnread = true
          return { ...n, read: true, isRead: true }
        }
        return n
      })

      return {
        notifications: updated,
        unreadCount: targetWasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      }
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true, isRead: true })),
      unreadCount: 0,
    })),

  removeNotification: (id) =>
    set((state) => {
      const target = state.notifications.find((n) => n.id === id)
      const targetWasUnread = target ? !target.read && !target.isRead : false
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: targetWasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      }
    }),

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
  reset: () => set({ notifications: [], unreadCount: 0, lastReceivedAt: null }),
}))

export default useNotificationStore
