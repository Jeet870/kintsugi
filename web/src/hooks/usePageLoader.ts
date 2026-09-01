import { useLoadingStore } from '@/stores/useLoadingStore'

export function usePageLoader() {
  const isLoading = useLoadingStore((state) => state.isLoading)
  const message = useLoadingStore((state) => state.message)
  const progress = useLoadingStore((state) => state.progress)
  const show = useLoadingStore((state) => state.show)
  const hide = useLoadingStore((state) => state.hide)
  const setProgress = useLoadingStore((state) => state.setProgress)
  const reset = useLoadingStore((state) => state.reset)

  return {
    isLoading,
    message,
    progress,
    showLoader: show,
    hideLoader: hide,
    setProgress,
    resetLoader: reset,
  }
}

export default usePageLoader
