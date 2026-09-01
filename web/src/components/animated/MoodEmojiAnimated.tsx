import React, { useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

/* ─── Design Tokens ─── */
const GOLD_ACCENT = '#FFD166'
const GOLD_GLOW_SHADOW = '0 0 16px rgba(255,209,102,.30)'

/* ─── Size Map ─── */
const SIZE_CONFIG = {
  sm: { container: 48, emoji: 22, label: 11, gap: 4 },
  md: { container: 64, emoji: 30, label: 12, gap: 6 },
  lg: { container: 80, emoji: 38, label: 13, gap: 8 },
} as const

type Size = keyof typeof SIZE_CONFIG

/* ─── Animation Variants ─── */
const FLOAT_TRANSITION = {
  duration: 5,
  repeat: Infinity,
  repeatType: 'mirror' as const,
  ease: 'easeInOut' as const,
}

const HOVER_SPRING = { type: 'spring' as const, stiffness: 280, damping: 18 }
const SELECT_SPRING = { type: 'spring' as const, stiffness: 420, damping: 18 }

/* ─── Gold Ring Variants ─── */
const RING_VARIANTS = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: [0.8, 1.15],
    opacity: [0, 0.35, 0],
  },
  exit: { scale: 0.8, opacity: 0 },
}

const RING_TRANSITION = {
  duration: 0.7,
  ease: 'easeOut' as const,
}

/* ─── Props ─── */
export interface MoodEmojiAnimatedProps {
  /** Emoji character to display */
  emoji: string
  /** Accessible label for the mood */
  label: string
  /** Whether this mood is currently selected */
  selected: boolean
  /** Disable interaction */
  disabled?: boolean
  /** Button size variant */
  size?: Size
  /** Show the text label below the emoji */
  showLabel?: boolean
  /** Selection callback */
  onSelect: () => void
  /** Additional CSS classes */
  className?: string
}

export const MoodEmojiAnimated: React.FC<MoodEmojiAnimatedProps> = React.memo(
  ({
    emoji,
    label,
    selected,
    disabled = false,
    size = 'md',
    showLabel = true,
    onSelect,
    className = '',
  }) => {
    const shouldReduceMotion = useReducedMotion()
    const isAnimated = !shouldReduceMotion
    const config = SIZE_CONFIG[size]

    /* ─── Memoized animation objects ─── */
    const floatAnimate = useMemo(
      () =>
        isAnimated && !disabled
          ? { y: [0, -3, 0] }
          : undefined,
      [isAnimated, disabled],
    )

    const hoverAnimate = useMemo(
      () =>
        isAnimated && !disabled
          ? { scale: 1.08, rotate: [0, 2, 0] }
          : undefined,
      [isAnimated, disabled],
    )

    const tapAnimate = useMemo(
      () =>
        isAnimated && !disabled
          ? { scale: 0.95 }
          : undefined,
      [isAnimated, disabled],
    )

    const selectedEmojiAnimate = useMemo(
      () =>
        isAnimated && selected
          ? { scale: [1, 1.15, 1] }
          : { scale: 1 },
      [isAnimated, selected],
    )

    const handleClick = useMemo(
      () => () => {
        if (!disabled) onSelect()
      },
      [disabled, onSelect],
    )

    const handleKeyDown = useMemo(
      () => (e: React.KeyboardEvent) => {
        if (disabled) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      },
      [disabled, onSelect],
    )

    return (
      <motion.button
        type="button"
        role="radio"
        aria-checked={selected}
        aria-label={`${label} mood`}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={[
          'relative flex flex-col items-center justify-center rounded-2xl border transition-colors',
          'outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
          selected
            ? 'bg-violet-900/40 border-violet-500/40'
            : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer',
          className,
        ].join(' ')}
        style={{
          width: config.container,
          height: config.container + (showLabel ? config.gap + config.label + 4 : 0),
          gap: config.gap,
          boxShadow: selected ? GOLD_GLOW_SHADOW : 'none',
          willChange: 'transform',
        }}
        whileHover={hoverAnimate}
        whileTap={tapAnimate}
        transition={HOVER_SPRING}
      >
        {/* ── Gold selection ring ── */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key="gold-ring"
              className="absolute rounded-full pointer-events-none"
              style={{
                width: config.container - 4,
                height: config.container - 4,
                top: '50%',
                left: '50%',
                marginTop: showLabel
                  ? -(config.gap + config.label + 4) / 2
                  : 0,
                transform: 'translate(-50%, -50%)',
                border: `2px solid ${GOLD_ACCENT}`,
              }}
              variants={RING_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={RING_TRANSITION}
            />
          )}
        </AnimatePresence>

        {/* ── Animated Emoji ── */}
        <motion.div
          className="select-none leading-none"
          style={{
            fontSize: config.emoji,
            willChange: 'transform',
          }}
          animate={{
            ...floatAnimate,
            ...(selected ? selectedEmojiAnimate : {}),
          }}
          transition={
            selected
              ? SELECT_SPRING
              : FLOAT_TRANSITION
          }
        >
          {emoji || '●'}
        </motion.div>

        {/* ── Label ── */}
        {showLabel && (
          <motion.span
            className="block font-medium leading-none truncate max-w-full px-1"
            style={{ fontSize: config.label }}
            animate={{
              color: selected ? '#FAFAFA' : '#A1A1AA',
              opacity: selected ? 1 : 0.8,
            }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {label}
          </motion.span>
        )}
      </motion.button>
    )
  },
)

MoodEmojiAnimated.displayName = 'MoodEmojiAnimated'

export default MoodEmojiAnimated
