import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { HugeiconsIcon } from '@hugeicons/react'
import { Analytics01Icon } from '@hugeicons/core-free-icons'

import { useMoodHistory } from '@/features/mood-tracker/hooks/useMoodHistory'
import { MOOD_OPTIONS } from '@/lib/constants/moodOptions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { MoodType } from '@/types/api'

export interface MoodStatsChartProps {
  userId?: string
  className?: string
}

type PeriodFilter = '7' | '30' | '90'

const MOOD_HEX_MAP: Record<MoodType, string> = {
  happy: '#FFD86B',
  calm: '#10B981',
  anxious: '#8B5CF6',
  sad: '#6366F1',
  angry: '#F43F5E',
  tired: '#A1A1AA',
}

export const MoodStatsChart: React.FC<MoodStatsChartProps> = React.memo(
  ({ userId = 'me', className = '' }) => {
    const [period, setPeriod] = useState<PeriodFilter>('30')

    /* 1. Reuse existing cached mood history query */
    const { data: moodEntriesData, isLoading, isError } = useMoodHistory({ userId })

    const entries = useMemo(() => moodEntriesData ?? [], [moodEntriesData])

    /* 2. Client-side derive filtered dataset per period threshold */
    const chartData = useMemo(() => {
      const days = Number(period)
      const now = new Date()
      const cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1))
      const cutoffMs = cutoffDate.getTime()

      /* Filter entries created within target period */
      const filteredEntries = entries.filter((entry) => {
        const rawDate = entry.entry_date || entry.created_at
        if (!rawDate) return true
        const entryTime = new Date(rawDate).getTime()
        if (isNaN(entryTime)) return true
        return entryTime >= cutoffMs
      })

      /* Calculate frequencies for each MOOD_OPTIONS item */
      const countsMap: Record<MoodType, number> = {
        happy: 0,
        calm: 0,
        anxious: 0,
        sad: 0,
        tired: 0,
        angry: 0,
      }

      filteredEntries.forEach((entry) => {
        if (countsMap[entry.mood_type] !== undefined) {
          countsMap[entry.mood_type] += 1
        }
      })

      /* Map to Recharts compatible dataset */
      return MOOD_OPTIONS.map((option) => {
        const moodType = option.id as MoodType
        return {
          mood: option.label,
          count: countsMap[moodType] || 0,
          color: MOOD_HEX_MAP[moodType] || '#D4AF37',
          emoji: option.emoji,
        }
      })
    }, [entries, period])

    const totalEntriesInPeriod = useMemo(
      () => chartData.reduce((acc, curr) => acc + curr.count, 0),
      [chartData],
    )

    return (
      <Card className={`overflow-hidden rounded-2xl border-border bg-card text-card-foreground shadow-xl text-left hover:border-amber-500/40 transition-colors ${className}`}>
        <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border bg-muted/40 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400 shadow-md">
              <HugeiconsIcon icon={Analytics01Icon} className="w-5 h-5 text-violet-500 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-card-foreground font-serif">
                Mood Distribution Frequency
              </CardTitle>
            </div>
          </div>

          {/* Period Filter Dropdown */}
          <Select value={period} onValueChange={(val) => setPeriod(val as PeriodFilter)}>
            <SelectTrigger className="h-9 px-3 bg-background border-border text-foreground focus:ring-violet-500/20 rounded-xl text-xs font-semibold w-[140px] cursor-pointer hover:border-amber-500/50 transition-colors">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-card-foreground">
              <SelectItem value="7" className="text-xs">Last 7 Days</SelectItem>
              <SelectItem value="30" className="text-xs">Last 30 Days</SelectItem>
              <SelectItem value="90" className="text-xs">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          {/* Skeleton Loading State */}
          {isLoading && (
            <div className="h-[240px] flex items-end justify-between gap-4 pt-6 px-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="w-12 rounded-t-lg bg-muted" style={{ height: `${i * 15 + 20}%` }} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (isError || totalEntriesInPeriod === 0) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6">
              <EmptyState
                icon={<HugeiconsIcon icon={Analytics01Icon} className="w-8 h-8 text-violet-500 dark:text-violet-400" />}
                title="No Check-Ins for Period"
                description={`No mood logs recorded in the last ${period} days.`}
                size="sm"
              />
            </motion.div>
          )}

          {/* Populated Recharts BarChart */}
          {!isLoading && !isError && totalEntriesInPeriod > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[260px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="mood"
                    stroke="currentColor"
                    className="text-muted-foreground"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'currentColor' }}
                  />
                  <YAxis
                    stroke="currentColor"
                    className="text-muted-foreground"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'currentColor' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    wrapperStyle={{ outline: 'none', border: 'none' }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null
                      const item = payload[0].payload
                      return (
                        <div className="p-3 rounded-xl border border-border bg-card text-card-foreground backdrop-blur-xl shadow-xl text-left space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-card-foreground">
                            <span>{item.emoji}</span>
                            <span>{item.mood}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            Logged <strong className="text-amber-600 dark:text-amber-300">{item.count}</strong> times in last {period} days
                          </p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </CardContent>
      </Card>
    )
  },
)

MoodStatsChart.displayName = 'MoodStatsChart'

export default MoodStatsChart
