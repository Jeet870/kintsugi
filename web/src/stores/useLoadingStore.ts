import { create } from 'zustand'

export interface LoadingState {
  isLoading: boolean
  message: string
  progress: number
  show: (message?: string) => void
  hide: () => void
  setProgress: (progress: number) => void
  reset: () => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  message: 'Preparing your wellness experience...',
  progress: 0,

  show: (message = 'Preparing your wellness experience...') =>
    set({
      isLoading: true,
      message,
      progress: 0,
    }),

  hide: () =>
    set({
      isLoading: false,
      progress: 100,
    }),

  setProgress: (progress: number) =>
    set({
      progress: Math.min(100, Math.max(0, progress)),
    }),

  reset: () =>
    set({
      isLoading: false,
      message: 'Preparing your wellness experience...',
      progress: 0,
    }),
}))

export default useLoadingStore
