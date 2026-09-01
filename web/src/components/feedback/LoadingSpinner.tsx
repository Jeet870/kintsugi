import React from 'react'

/* ─── Size Map (px) ─── */
const SIZE_MAP = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
} as const

type SpinnerSize = keyof typeof SIZE_MAP

/* ─── Design Tokens ─── */
const GOLD_ACCENT = '#FFD166'
const INACTIVE_BORDER = '#3f3f46' // zinc-700

/* ─── Props ─── */
export interface LoadingSpinnerProps {
  /** Spinner diameter variant */
  size?: SpinnerSize
  /** Additional CSS classes */
  className?: string
  /** Accessible loading label (defaults to "Loading...") */
  label?: string
  /** Center the spinner in a fixed overlay */
  fullScreen?: boolean
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(
  ({ size = 'md', className = '', label, fullScreen = false }) => {
    const px = SIZE_MAP[size] ?? SIZE_MAP.md

    const spinner = (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={`inline-flex items-center justify-center ${className}`}
      >
        <div
          className="rounded-full animate-spin border-2"
          style={{
            width: px,
            height: px,
            borderColor: INACTIVE_BORDER,
            borderTopColor: GOLD_ACCENT,
          }}
        />
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    )

    if (fullScreen) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
          {spinner}
        </div>
      )
    }

    return spinner
  },
)

LoadingSpinner.displayName = 'LoadingSpinner'

export default LoadingSpinner
