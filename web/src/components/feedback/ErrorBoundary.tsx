import React, { Component, useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { HeartHandshake } from 'lucide-react'
import { Button } from '@/components/ui/button'

/* ─── Error Logging Utility ─── */
interface ErrorReport {
  error: Error
  componentStack?: string
  timestamp: string
  url: string
  userAgent: string
}

/**
 * Extensible error logger.
 * Replace the body of this function with Sentry, LogRocket, Datadog,
 * OpenTelemetry, or any monitoring service — no changes to ErrorBoundary needed.
 */
function logError(error: Error, errorInfo: React.ErrorInfo): void {
  const report: ErrorReport = {
    error,
    componentStack: errorInfo.componentStack ?? undefined,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  }

  // eslint-disable-next-line no-console
  console.error('[Kintsugi ErrorBoundary]', report)
}

/* ─── State & Props ─── */
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export interface ErrorBoundaryProps {
  /** Application content */
  children: React.ReactNode
  /** Optional custom fallback UI — replaces the default recovery screen */
  fallback?: React.ReactNode
}

/* ─── Class-Based Error Boundary ─── */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: undefined }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError(error, errorInfo)
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: undefined })
  }

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.props.fallback) {
      return this.props.fallback
    }

    return (
      <DefaultFallback onReset={this.resetErrorBoundary} />
    )
  }
}

/* ─── Animation Constants ─── */
const CARD_TRANSITION = { duration: 0.35, ease: 'easeOut' as const }
const FLOAT_TRANSITION = {
  duration: 6,
  repeat: Infinity,
  repeatType: 'mirror' as const,
  ease: 'easeInOut' as const,
}

/* ─── Default Fallback (Functional Component) ─── */
interface DefaultFallbackProps {
  onReset: () => void
}

const DefaultFallback: React.FC<DefaultFallbackProps> = React.memo(
  ({ onReset }) => {
    const shouldReduceMotion = useReducedMotion()
    const isAnimated = !shouldReduceMotion
    const retryRef = useRef<HTMLButtonElement>(null)

    /* Move focus to the retry button on mount */
    useEffect(() => {
      retryRef.current?.focus()
    }, [])

    const handleReload = (): void => {
      window.location.reload()
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-6">
        <motion.div
          role="alert"
          aria-live="assertive"
          className="max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl shadow-2xl p-10 text-center space-y-6"
          initial={isAnimated ? { opacity: 0, scale: 0.96 } : undefined}
          animate={isAnimated ? { opacity: 1, scale: 1 } : undefined}
          transition={CARD_TRANSITION}
        >
          {/* Icon */}
          <motion.div
            className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-violet-500/10 text-violet-300"
            aria-hidden="true"
            animate={isAnimated ? { y: [0, -4, 0] } : undefined}
            transition={FLOAT_TRANSITION}
          >
            <HeartHandshake className="w-7 h-7" />
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Something went wrong.
            <br />
            Let's try again.
          </h2>

          {/* Description */}
          <p className="text-zinc-400 leading-relaxed text-sm max-w-md mx-auto">
            An unexpected issue interrupted your experience.
            Your information is safe. Please try again.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              ref={retryRef}
              onClick={onReset}
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold gap-2"
            >
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={handleReload}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Reload Application
            </Button>
          </div>
        </motion.div>
      </div>
    )
  },
)

DefaultFallback.displayName = 'DefaultFallback'

export default ErrorBoundary
