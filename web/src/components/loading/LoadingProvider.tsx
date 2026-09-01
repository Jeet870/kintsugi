import React, { createContext, useContext } from 'react'
import { useLoadingStore } from '@/stores/useLoadingStore'
import { LoadingOverlay } from '@/components/loading/LoadingOverlay'

export interface LoadingContextValue {
  showLoader: (message?: string) => void
  hideLoader: () => void
  setProgress: (progress: number) => void
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined)

export interface LoadingProviderProps {
  children: React.ReactNode
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const show = useLoadingStore((state) => state.show)
  const hide = useLoadingStore((state) => state.hide)
  const setProgress = useLoadingStore((state) => state.setProgress)

  const value = React.useMemo(
    () => ({
      showLoader: show,
      hideLoader: hide,
      setProgress,
    }),
    [show, hide, setProgress],
  )

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlay />
    </LoadingContext.Provider>
  )
}

export const useLoading = (): LoadingContextValue => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

export default LoadingProvider
