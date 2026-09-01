import React from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PlayIcon,
  PauseIcon,
  RotateLeftIcon,
  Clock01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

export interface BreathingSessionDuration {
  label: string
  seconds: number
}

export const BREATHING_SESSION_DURATIONS: readonly BreathingSessionDuration[] = Object.freeze([
  { label: '1 Minute', seconds: 60 },
  { label: '3 Minutes', seconds: 180 },
  { label: '5 Minutes', seconds: 300 },
  { label: '10 Minutes', seconds: 600 },
])

export interface BreathingControlsProps {
  isRunning: boolean
  isPaused: boolean
  cycle?: number
  remainingTime?: number
  sessionDurationSec?: number
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onDurationChange?: (seconds: number) => void
  className?: string
}

export const BreathingControls: React.FC<BreathingControlsProps> = React.memo(
  ({
    isRunning,
    isPaused,
    cycle = 1,
    remainingTime,
    sessionDurationSec = 180,
    onStart,
    onPause,
    onResume,
    onReset,
    onDurationChange,
    className = '',
  }) => {
    /* Helper to format seconds into MM:SS format */
    const formatFormattedTime = (totalSec?: number) => {
      if (totalSec === undefined || totalSec === null) return '00:00'
      const mins = Math.floor(Math.max(0, totalSec) / 60)
      const secs = Math.floor(Math.max(0, totalSec) % 60)
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    return (
      <div className={`space-y-5 max-w-md mx-auto select-none ${className}`}>
        {/* Cycle & Session Timer Badge Header */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-border bg-muted/40 backdrop-blur-xl text-xs font-mono">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <HugeiconsIcon icon={SparklesIcon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Completed Cycles:</span>
            <span className="font-bold text-amber-600 dark:text-amber-300">{cycle}</span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <HugeiconsIcon icon={Clock01Icon} className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
            <span>Remaining Time:</span>
            <span className="font-bold text-foreground font-mono">
              {formatFormattedTime(remainingTime ?? sessionDurationSec)}
            </span>
          </div>
        </div>

        {/* Main Interaction Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Duration Selector Dropdown */}
          <div className="w-full sm:w-auto">
            <Select
              disabled={isRunning}
              value={String(sessionDurationSec)}
              onValueChange={(val) => onDurationChange?.(Number(val))}
            >
              <SelectTrigger className="h-11 px-3.5 bg-background border-border text-foreground focus:ring-violet-500/20 rounded-xl text-xs font-semibold w-full sm:w-[130px] hover:border-amber-500/50 transition-colors">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-card-foreground">
                {BREATHING_SESSION_DURATIONS.map((dur) => (
                  <SelectItem key={dur.seconds} value={String(dur.seconds)} className="text-xs">
                    {dur.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Primary Play / Pause / Resume Button */}
          {!isRunning ? (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Button
                onClick={onStart}
                className="w-full h-11 px-8 bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20 gap-2 border border-amber-300/50 text-xs sm:text-sm cursor-pointer"
              >
                <HugeiconsIcon icon={PlayIcon} className="w-4 h-4 text-slate-950" />
                <span>Start Session</span>
              </Button>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {isPaused ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
                  <Button
                    onClick={onResume}
                    className="w-full h-11 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl gap-2 shadow-lg shadow-emerald-600/20 border border-emerald-400/20 text-xs sm:text-sm cursor-pointer"
                  >
                    <HugeiconsIcon icon={PlayIcon} className="w-4 h-4 text-white" />
                    <span>Resume</span>
                  </Button>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
                  <Button
                    onClick={onPause}
                    variant="outline"
                    className="w-full h-11 px-6 bg-background border-border text-foreground hover:bg-muted rounded-xl gap-2 text-xs sm:text-sm cursor-pointer transition-colors"
                  >
                    <HugeiconsIcon icon={PauseIcon} className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Pause</span>
                  </Button>
                </motion.div>
              )}

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={onReset}
                  variant="outline"
                  className="h-11 px-4 bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl text-xs cursor-pointer transition-colors"
                >
                  <HugeiconsIcon icon={RotateLeftIcon} className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    )
  },
)

BreathingControls.displayName = 'BreathingControls'

export default BreathingControls
