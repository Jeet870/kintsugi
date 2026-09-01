import { create } from 'zustand'

interface UserSession {
  id: number
  name: string
  email: string
  streak: number
}

interface AppStore {
  user: UserSession | null
  isAuthenticated: boolean
  notificationCount: number
  theme: 'dark' | 'light'
  setUserSession: (user: UserSession | null) => void
  setNotificationCount: (count: number) => void
  incrementNotifications: () => void
  toggleTheme: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  user: { id: 1, name: 'Kintsugi User', email: 'user@example.com', streak: 3 },
  isAuthenticated: true,
  notificationCount: 2,
  theme: 'dark',
  setUserSession: (user) => set({ user, isAuthenticated: !!user }),
  setNotificationCount: (count) => set({ notificationCount: count }),
  incrementNotifications: () => set((state) => ({ notificationCount: state.notificationCount + 1 })),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}))
