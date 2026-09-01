import ErrorBoundary from '@/components/feedback/ErrorBoundary'
import { AppProviders } from '@/app/providers/AppProviders'
import { AppRouter } from '@/app/router/AppRouter'
import { LoadingProvider } from '@/components/loading/LoadingProvider'

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <LoadingProvider>
          <AppRouter />
        </LoadingProvider>
      </AppProviders>
    </ErrorBoundary>
  )
}

export default App
