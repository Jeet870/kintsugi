import { create } from 'zustand'

export interface ToastItem {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'destructive' | 'warning' | 'info'
  duration?: number
}

export type ActiveModalType =
  | null
  | 'settings'
  | 'profile'
  | 'journal'
  | 'notifications'
  | 'delete-confirmation'
  | 'mood-checkin'
  | string

export interface UIState {
  /* State */
  isMobileNavOpen: boolean
  activeModal: ActiveModalType
  isGlobalLoading: boolean
  toastQueue: ToastItem[]
  isCommandPaletteOpen: boolean

  /* Mobile Nav Actions */
  openMobileNav: () => void
  closeMobileNav: () => void
  toggleMobileNav: () => void

  /* Modal Actions */
  openModal: (modal: ActiveModalType) => void
  closeModal: () => void

  /* Global Loading Actions */
  showGlobalLoader: () => void
  hideGlobalLoader: () => void

  /* Toast Actions */
  enqueueToast: (toast: Omit<ToastItem, 'id'> & { id?: string }) => void
  removeToast: (id: string) => void
  clearToasts: () => void

  /* Command Palette Actions */
  openCommandPalette: () => void
  closeCommandPalette: () => void
}

/**
 * useUIStore — Zustand Ephemeral Transient UI State Store.
 *
 * Architecture & Design Rationale:
 *
 * 1. Why UI State Is NOT Persisted:
 *    - Transient visual overlays (modals, drawers, toasts, loaders, navigation sheets) represent
 *      temporary interaction states. Persisting them across browser reloads leads to stuck modals,
 *      duplicate toasts, and corrupted layout states.
 *
 * 2. Why This Store Remains Framework-Agnostic:
 *    - Exposes plain data models and synchronous state transitions without depending on any UI library
 *      (e.g., Radix, shadcn, Sonner). This allows any visual component to bind to UI state cleanly.
 *
 * 3. Why Business Logic Must Never Enter This Store:
 *    - This store handles only visibility flags, modal IDs, and toast arrays. API fetching, auth checks,
 *      and domain mutations belong strictly in TanStack Query, Services, and Domain Stores.
 */
export const useUIStore = create<UIState>((set) => ({
  /* Initial Ephemeral State */
  isMobileNavOpen: false,
  activeModal: null,
  isGlobalLoading: false,
  toastQueue: [],
  isCommandPaletteOpen: false,

  /* Mobile Navigation */
  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
  toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),

  /* Modals */
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),

  /* Global Loader */
  showGlobalLoader: () => set({ isGlobalLoading: true }),
  hideGlobalLoader: () => set({ isGlobalLoading: false }),

  /* Toast Queue */
  enqueueToast: (toast) =>
    set((state) => {
      const id = toast.id || `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      const newToast: ToastItem = { ...toast, id }
      return { toastQueue: [...state.toastQueue, newToast] }
    }),

  removeToast: (id) =>
    set((state) => ({
      toastQueue: state.toastQueue.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toastQueue: [] }),

  /* Command Palette */
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
}))

export default useUIStore
