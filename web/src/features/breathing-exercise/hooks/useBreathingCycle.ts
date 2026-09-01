import { useState, useRef, useEffect, useCallback } from 'react'

export type BreathingPhase = 'inhale' | 'hold' | 'exhale'

export interface BreathingDurations {
  inhale: number // in seconds
  hold: number // in seconds
  exhale: number // in seconds
}

export interface UseBreathingCycleOptions {
  durations?: Partial<BreathingDurations>
  autoStart?: boolean
  onPhaseChange?: (phase: BreathingPhase) => void
  onCycleComplete?: (completedCycles: number) => void
}

export interface UseBreathingCycleReturn {
  phase: BreathingPhase
  progress: number
  remainingTime: number
  cycle: number
  isRunning: boolean
  isPaused: boolean
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  reset: () => void
}

const DEFAULT_DURATIONS: BreathingDurations = {
  inhale: 4,
  hold: 4,
  exhale: 6,
}

/**
 * Pure client-side Breathing Cycle State Machine Hook.
 *
 * Provides a high-resolution 60fps/120fps timing engine using `requestAnimationFrame()`
 * and drift-free `performance.now()` timestamp calculations.
 *
 * Manages transitions between `inhale` -> `hold` -> `exhale` -> repeat.
 * Completely presentation-independent and UI-decoupled.
 */
export function useBreathingCycle(options?: UseBreathingCycleOptions): UseBreathingCycleReturn {
  const inhaleDur = Math.max(0.5, options?.durations?.inhale ?? DEFAULT_DURATIONS.inhale)
  const holdDur = Math.max(0, options?.durations?.hold ?? DEFAULT_DURATIONS.hold)
  const exhaleDur = Math.max(0.5, options?.durations?.exhale ?? DEFAULT_DURATIONS.exhale)

  /* 1. All useState hooks at top level */
  const [phase, setPhase] = useState<BreathingPhase>('inhale')
  const [progress, setProgress] = useState<number>(0)
  const [remainingTime, setRemainingTime] = useState<number>(inhaleDur)
  const [cycle, setCycle] = useState<number>(1)
  const [isRunning, setIsRunning] = useState<boolean>(options?.autoStart ?? false)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  /* 2. All useRef hooks grouped together */
  const durationsRef = useRef<BreathingDurations>({
    inhale: inhaleDur,
    hold: holdDur,
    exhale: exhaleDur,
  })
  const optionsRef = useRef(options)

  const animFrameRef = useRef<number | null>(null)
  const phaseStartTimeRef = useRef<number>(0)
  const pausedAtTimeRef = useRef<number>(0)
  const accumulatedPauseDurationRef = useRef<number>(0)

  const currentPhaseRef = useRef<BreathingPhase>('inhale')
  const isRunningRef = useRef<boolean>(options?.autoStart ?? false)
  const isPausedRef = useRef<boolean>(false)
  const cycleRef = useRef<number>(1)
  const tickRef = useRef<() => void>(() => {})

  // Keep refs in sync with state for loop execution
  currentPhaseRef.current = phase
  isRunningRef.current = isRunning
  isPausedRef.current = isPaused
  cycleRef.current = cycle

  /* 3. All useEffect hooks grouped together */
  useEffect(() => {
    durationsRef.current = { inhale: inhaleDur, hold: holdDur, exhale: exhaleDur }
  }, [inhaleDur, holdDur, exhaleDur])

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  /* 4. Mutable Loop Tick Function */
  tickRef.current = () => {
    if (!isRunningRef.current || isPausedRef.current) return

    const now = performance.now()
    const activePhase = currentPhaseRef.current
    const targetDurationSec = durationsRef.current[activePhase] || 4
    const targetDurationMs = targetDurationSec * 1000

    /* Calculate elapsed time accounting for pause duration */
    const elapsedMs = Math.max(
      0,
      now - phaseStartTimeRef.current - accumulatedPauseDurationRef.current,
    )

    if (elapsedMs >= targetDurationMs) {
      /* Determine next phase in cycle */
      let nextPhase: BreathingPhase = 'inhale'

      if (activePhase === 'inhale') {
        nextPhase = durationsRef.current.hold > 0 ? 'hold' : 'exhale'
      } else if (activePhase === 'hold') {
        nextPhase = 'exhale'
      } else {
        nextPhase = 'inhale'
        const completedCycleCount = cycleRef.current + 1
        setCycle(completedCycleCount)
        cycleRef.current = completedCycleCount
        optionsRef.current?.onCycleComplete?.(completedCycleCount - 1)
      }

      /* Advance to next phase */
      setPhase(nextPhase)
      currentPhaseRef.current = nextPhase
      setProgress(0)
      setRemainingTime(durationsRef.current[nextPhase])

      /* Reset phase start time reference */
      phaseStartTimeRef.current = performance.now()
      accumulatedPauseDurationRef.current = 0

      optionsRef.current?.onPhaseChange?.(nextPhase)
    } else {
      /* Update continuous sub-second progress and remaining time */
      const currentProgress = Math.min(1, Math.max(0, elapsedMs / targetDurationMs))
      const currentRemaining = Math.max(0, (targetDurationMs - elapsedMs) / 1000)

      setProgress(currentProgress)
      setRemainingTime(currentRemaining)
    }

    animFrameRef.current = requestAnimationFrame(() => tickRef.current())
  }

  /* 5. All useCallback hooks grouped together */
  const cancelLoop = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    cancelLoop()
    const now = performance.now()
    phaseStartTimeRef.current = now
    accumulatedPauseDurationRef.current = 0

    setPhase('inhale')
    currentPhaseRef.current = 'inhale'
    setProgress(0)
    setRemainingTime(durationsRef.current.inhale)
    setCycle(1)
    cycleRef.current = 1
    setIsRunning(true)
    setIsPaused(false)
    isRunningRef.current = true
    isPausedRef.current = false

    optionsRef.current?.onPhaseChange?.('inhale')
    animFrameRef.current = requestAnimationFrame(() => tickRef.current())
  }, [cancelLoop])

  const pause = useCallback(() => {
    if (!isRunningRef.current || isPausedRef.current) return
    cancelLoop()
    pausedAtTimeRef.current = performance.now()
    setIsPaused(true)
    isPausedRef.current = true
  }, [cancelLoop])

  const resume = useCallback(() => {
    if (!isRunningRef.current || !isPausedRef.current) return
    cancelLoop()

    /* Add duration spent in pause to accumulated pause offset */
    const pauseDuration = performance.now() - pausedAtTimeRef.current
    accumulatedPauseDurationRef.current += pauseDuration

    setIsPaused(false)
    isPausedRef.current = false
    animFrameRef.current = requestAnimationFrame(() => tickRef.current())
  }, [cancelLoop])

  const stop = useCallback(() => {
    cancelLoop()
    setIsRunning(false)
    setIsPaused(false)
    isRunningRef.current = false
    isPausedRef.current = false
    setPhase('inhale')
    currentPhaseRef.current = 'inhale'
    setProgress(0)
    setRemainingTime(durationsRef.current.inhale)
    setCycle(1)
    cycleRef.current = 1
  }, [cancelLoop])

  const reset = useCallback(() => {
    stop()
  }, [stop])

  /* 6. AutoStart lifecycle handler */
  useEffect(() => {
    if (options?.autoStart) {
      start()
    }
    return () => {
      cancelLoop()
    }
  }, [options?.autoStart, start, cancelLoop])

  return {
    phase,
    progress,
    remainingTime,
    cycle,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
  }
}

export default useBreathingCycle
