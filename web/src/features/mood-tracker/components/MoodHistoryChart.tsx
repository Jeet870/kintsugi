import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ChartLineData01Icon,
  Analytics01Icon,
  Calendar01Icon,
  Note01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons'

import { useMoodHistory } from '@/features/mood-tracker/hooks/useMoodHistory'
import { getMoodById, getMoodEmoji, getMoodLabel } from '@/lib/constants/moodOptions'
import { formatShortDate } from '@/lib/utils/formatDate'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export interface MoodHistoryChartProps {
  userId?: string
  limit?: number
  className?: string
}

interface ChartDataPoint {
  id: string | number
  uniqueKey: string
  date: string
  formattedDate: string
  rawMood: string
  score: number
  emoji: string
  label: string
  note: string | null
}

export const MoodHistoryChart: React.FC<MoodHistoryChartProps> = ({
  userId = 'me',
  limit = 30,
  className = '',
}) => {
  const { data: history, isLoading } = useMoodHistory({
    userId,
    params: { skip: 0, limit },
  })

  /* ─── Memoized Dynamic Chart Data Transformation ─── */
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!history || history.length === 0) return []

    /* Reverse array so oldest entry is on the left and newest is on the right */
    const sorted = [...history].reverse()

    return sorted.map((entry, idx) => {
      const moodDef = getMoodById(entry.mood_type)
      const score = moodDef?.value ?? 3
      const emoji = getMoodEmoji(entry.mood_type)
      const label = getMoodLabel(entry.mood_type)
      const dateStr = entry.entry_date || entry.created_at
      const formattedDate = formatShortDate(dateStr)

      return {
        id: entry.id,
        uniqueKey: `${entry.id}-${idx}`,
        date: dateStr,
        formattedDate,
        rawMood: entry.mood_type,
        score,
        emoji,
        label,
        note: entry.note ?? null,
      }
    })
  }, [history])

  return (
    <Card className={`border-border bg-card shadow-sm text-left rounded-lg flex flex-col relative z-20 transition-colors duration-250 ${className}`}>
      <CardHeader className="p-5 sm:p-6 pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
            <HugeiconsIcon icon={ChartLineData01Icon} className="w-4.5 h-4.5" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-card-foreground">
              Emotional Trajectory
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
              30-day trend from daily check-ins
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-2 flex-1">
        <AnimatePresence mode="wait">
          {/* ── State 1: Skeleton Loading Placeholder ── */}
          {isLoading && !history && (
            <motion.div
              key="loading-chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[260px] flex items-center justify-center p-4"
            >
              <Skeleton className="w-full h-full bg-muted/60 rounded-xl" />
            </motion.div>
          )}

          {/* ── State 2: Insufficient Data Empty State ── */}
          {!isLoading && chartData.length === 0 && (
            <motion.div
              key="empty-chart"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <EmptyState
                icon={<HugeiconsIcon icon={Analytics01Icon} className="w-8 h-8 text-amber-400" />}
                title="Insufficient Trend Data"
                description="Track your mood consistently to unlock personalized trends and insights."
                size="sm"
              />
            </motion.div>
          )}

          {/* ── State 3: Recharts Area Chart ── */}
          {!isLoading && chartData.length > 0 && (
            <motion.div
              key="chart-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[260px] w-full pt-4 outline-none focus:outline-none focus:ring-0 [&_*]:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="goldIndigoGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.45} />
                      <stop offset="50%" stopColor="#D4AF37" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 140, 140, 0.12)" vertical={false} />

                  <XAxis
                    dataKey="uniqueKey"
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(140, 140, 140, 0.2)' }}
                    tickFormatter={(_val: string, idx: number) => chartData[idx]?.formattedDate ?? ''}
                  />

                  <YAxis
                    domain={[0, 7]}
                    ticks={[1, 2, 3, 4, 5, 6]}
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val: number) => {
                      if (val === 6) return '😌'
                      if (val === 5) return '😊'
                      if (val === 4) return '😫'
                      if (val === 3) return '😰'
                      if (val === 2) return '😢'
                      if (val === 1) return '😠'
                      return ''
                    }}
                  />

                  <Tooltip
                    content={<CustomChartTooltip />}
                    wrapperStyle={{ outline: 'none', border: 'none', zIndex: 9999, pointerEvents: 'none' }}
                    allowEscapeViewBox={{ x: true, y: true }}
                    cursor={{ stroke: 'rgba(168, 85, 247, 0.5)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                    isAnimationActive={false}
                  />

                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#8B5CF6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#goldIndigoGradient)"
                    dot={{
                      r: 5,
                      fill: '#8B5CF6',
                      stroke: 'var(--card)',
                      strokeWidth: 1.5,
                      cursor: 'pointer',
                    }}
                    activeDot={{
                      r: 8,
                      fill: '#D4AF37',
                      stroke: '#FFFFFF',
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

/* ─── Sub-Component: Custom Recharts Tooltip ─── */
const CustomChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null

  const data: ChartDataPoint = payload[0].payload
  if (!data) return null

  return (
    <div className="p-3.5 rounded-xl border border-border bg-card/95 backdrop-blur-2xl shadow-xl text-left space-y-2 max-w-xs z-50 focus:outline-none select-none pointer-events-none">
      {/* Header: Emoji, Mood Label & Date */}
      <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{data.emoji}</span>
          <div>
            <h5 className="text-xs font-bold text-card-foreground">{data.label}</h5>
            <span className="text-[10px] font-semibold text-violet-500 dark:text-violet-400">Score: {data.score}/6</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-muted/80 px-2 py-0.5 rounded border border-border">
          <HugeiconsIcon icon={Calendar01Icon} className="w-3 h-3 text-muted-foreground" />
          <span>{data.formattedDate}</span>
        </div>
      </div>

      {/* Body: Note Preview */}
      {data.note ? (
        <div className="flex items-start gap-1.5 text-[11px] text-foreground italic leading-relaxed pt-0.5">
          <HugeiconsIcon icon={Note01Icon} className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 shrink-0 mt-0.5" />
          <p className="line-clamp-2">"{data.note}"</p>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-0.5">
          <HugeiconsIcon icon={SparklesIcon} className="w-3 h-3 text-muted-foreground" />
          <span>No reflection note provided.</span>
        </div>
      )}
    </div>
  )
}

export default MoodHistoryChart
