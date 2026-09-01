import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SparklesIcon,
  CheckmarkCircle02Icon,
  LockIcon,
  Leaf01Icon,
  HeartIcon,
  Book01Icon,
  Shield02Icon,
  StarIcon,
} from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useAchievementCatalog, useUserAchievements } from '../hooks/useAchievements'
import type { Achievement, UserAchievement } from '@/types/api'

/* ── Icon mapping from backend icon_url codes to HugeIcons ── */
const ICON_MAP: Record<string, { icon: any; color: string }> = {
  heart:    { icon: HeartIcon,    color: 'text-rose-400' },
  book:     { icon: Book01Icon,   color: 'text-violet-400' },
  shield:   { icon: Shield02Icon, color: 'text-purple-400' },
  sparkles: { icon: SparklesIcon, color: 'text-amber-400' },
  trophy:   { icon: StarIcon,     color: 'text-amber-400' },
  star:     { icon: StarIcon,     color: 'text-teal-400' },
  crown:    { icon: StarIcon,     color: 'text-yellow-400' },
  leaf:     { icon: Leaf01Icon,   color: 'text-emerald-400' },
}

function getIconForCode(iconUrl?: string | null) {
  const mapping = ICON_MAP[iconUrl ?? ''] ?? ICON_MAP['star']
  return mapping
}

/* ── XP per achievement code ── */
const XP_MAP: Record<string, number> = {
  first_mood_logged: 50,
  first_journal_entry: 100,
  wellness_seeker: 300,
  companion_chatter: 150,
  '7_day_streak': 200,
  '30_day_streak': 500,
  '100_day_streak': 1000,
}

/* ── Progress thresholds per code ── */
const THRESHOLD_MAP: Record<string, number> = {
  first_mood_logged: 1,
  first_journal_entry: 1,
  wellness_seeker: 10,
  companion_chatter: 5,
  '7_day_streak': 7,
  '30_day_streak': 30,
  '100_day_streak': 100,
}

interface MergedBadge {
  id: string
  code: string
  title: string
  description: string
  unlocked: boolean
  unlockedAt?: string
  xp: number
  maxProgress: number
  icon: React.ReactNode
}

export const AchievementsPage: React.FC = React.memo(() => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')

  const { data: catalog, isLoading: catalogLoading } = useAchievementCatalog()
  const { data: userAchievements, isLoading: userLoading } = useUserAchievements()

  const isLoading = catalogLoading || userLoading

  /* Merge catalog + user earned badges into a single list */
  const badges: MergedBadge[] = useMemo(() => {
    if (!catalog || catalog.length === 0) return []

    const earnedMap = new Map<string, UserAchievement>()
    if (userAchievements?.earned_achievements) {
      for (const ua of userAchievements.earned_achievements) {
        const code = ua.achievement?.code ?? ua.code ?? ''
        if (code) earnedMap.set(code, ua)
      }
    }

    return catalog.map((ach: Achievement) => {
      const earned = earnedMap.get(ach.code)
      const iconMapping = getIconForCode(ach.icon ?? (ach as any).icon_url)
      return {
        id: String(ach.id),
        code: ach.code,
        title: ach.title,
        description: ach.description,
        unlocked: !!earned,
        unlockedAt: earned?.earned_at?.slice(0, 10),
        xp: XP_MAP[ach.code] ?? 100,
        maxProgress: THRESHOLD_MAP[ach.code] ?? 1,
        icon: <HugeiconsIcon icon={iconMapping.icon} className={`w-5 h-5 ${iconMapping.color}`} />,
      }
    })
  }, [catalog, userAchievements])

  const filteredBadges = useMemo(() => {
    return badges.filter((b) => {
      if (filter === 'unlocked') return b.unlocked
      if (filter === 'locked') return !b.unlocked
      return true
    })
  }, [badges, filter])

  const stats = useMemo(() => {
    const unlocked = badges.filter((b) => b.unlocked)
    const totalXp = unlocked.reduce((acc, b) => acc + b.xp, 0)
    return {
      unlockedCount: unlocked.length,
      totalCount: badges.length,
      totalXp,
      level: Math.floor(totalXp / 250) + 1,
      currentStreak: userAchievements?.current_streak ?? 0,
      longestStreak: userAchievements?.longest_streak ?? 0,
    }
  }, [badges, userAchievements])

  const rankName = useMemo(() => {
    if (stats.level >= 10) return 'Zen Master'
    if (stats.level >= 7) return 'Mindfulness Champion'
    if (stats.level >= 4) return 'Wellness Practitioner'
    if (stats.level >= 2) return 'Mindful Apprentice'
    return 'Beginner Seeker'
  }, [stats.level])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500/40 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-mono">Loading achievements…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-16 pt-3 sm:pt-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 select-none font-sans relative">
      {/* Ambient Background Soft Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-amber-500/5 via-violet-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* ── 1. Hero Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 text-left">
        <div className="flex items-start gap-3.5 z-10">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0 shadow-md mt-1">
            <HugeiconsIcon icon={StarIcon} className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-serif">
              Achievements & Milestones
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans max-w-md leading-relaxed">
              Celebrate your personal consistency and emotional growth without comparison or pressure.
            </p>
          </div>
        </div>

        {/* Level Badge */}
        <div className="self-start sm:self-center shrink-0 z-10">
          <Badge
            variant="outline"
            className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md shadow-xs"
          >
            <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse" />
            <span>Level {stats.level} • {stats.totalXp} XP</span>
          </Badge>
        </div>
      </header>

      {/* ── 2. Overview Stats Cards Grid ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-5 rounded-2xl border border-amber-500/20 bg-card text-card-foreground backdrop-blur-xl shadow-sm text-left space-y-2 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>Unlocked Badges</span>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-3xl font-bold font-serif text-amber-600 dark:text-amber-300">
            {stats.unlockedCount} <span className="text-sm font-sans font-normal text-muted-foreground">/ {stats.totalCount}</span>
          </p>
        </Card>

        <Card className="p-5 rounded-2xl border border-purple-500/20 bg-card text-card-foreground backdrop-blur-xl shadow-sm text-left space-y-2 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>Wellness Points (XP)</span>
            <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold font-serif text-purple-600 dark:text-purple-300">
            {stats.totalXp} <span className="text-xs font-sans font-normal text-muted-foreground">XP</span>
          </p>
        </Card>

        <Card className="p-5 rounded-2xl border border-emerald-500/20 bg-card text-card-foreground backdrop-blur-xl shadow-sm text-left space-y-2 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>Current Streak</span>
            <HugeiconsIcon icon={Leaf01Icon} className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-3xl font-bold font-serif text-emerald-600 dark:text-emerald-300">
            {stats.currentStreak} <span className="text-xs font-sans font-normal text-muted-foreground">days</span>
          </p>
        </Card>

        <Card className="p-5 rounded-2xl border border-teal-500/20 bg-card text-card-foreground backdrop-blur-xl shadow-sm text-left space-y-2 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>Current Rank</span>
            <HugeiconsIcon icon={StarIcon} className="w-4 h-4 text-teal-500 dark:text-teal-400" />
          </div>
          <p className="text-xl font-bold font-serif text-teal-600 dark:text-teal-200 truncate">
            {rankName}
          </p>
        </Card>
      </section>

      {/* ── 3. Filter Buttons ── */}
      <section className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className={`h-8 px-3.5 text-xs rounded-xl font-medium cursor-pointer transition-all ${
            filter === 'all'
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-xs'
              : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          All Badges ({stats.totalCount})
        </Button>
        <Button
          size="sm"
          variant={filter === 'unlocked' ? 'default' : 'outline'}
          onClick={() => setFilter('unlocked')}
          className={`h-8 px-3.5 text-xs rounded-xl font-medium cursor-pointer transition-all ${
            filter === 'unlocked'
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-xs'
              : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Unlocked ({stats.unlockedCount})
        </Button>
        <Button
          size="sm"
          variant={filter === 'locked' ? 'default' : 'outline'}
          onClick={() => setFilter('locked')}
          className={`h-8 px-3.5 text-xs rounded-xl font-medium cursor-pointer transition-all ${
            filter === 'locked'
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-xs'
              : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          In Progress ({stats.totalCount - stats.unlockedCount})
        </Button>
      </section>

      {/* ── 4. Achievements Cards Grid ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBadges.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center gap-3">
            <HugeiconsIcon icon={LockIcon} className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-sans">
              {filter === 'unlocked'
                ? 'No badges unlocked yet. Keep engaging to earn rewards!'
                : filter === 'locked'
                ? 'All badges earned — you&apos;re a Zen Master!'
                : 'No achievements available.'}
            </p>
          </div>
        )}

        {filteredBadges.map((ach) => {
          const rawVal = ach.code === 'first_mood_logged'
            ? (userAchievements?.mood_count ?? 0)
            : ach.code === 'first_journal_entry' || ach.code === 'wellness_seeker'
            ? (userAchievements?.journal_count ?? 0)
            : ach.code === 'companion_chatter'
            ? (userAchievements?.chat_count ?? 0)
            : (userAchievements?.current_streak ?? 0)

          const currentVal = ach.unlocked
            ? ach.maxProgress
            : Math.min(rawVal, ach.maxProgress)

          const progressPercent = ach.unlocked
            ? 100
            : Math.min(100, Math.round((currentVal / ach.maxProgress) * 100))

          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={`p-5 rounded-2xl border transition-all h-full flex flex-col justify-between space-y-4 ${
                  ach.unlocked
                    ? 'border-amber-500/30 bg-card text-card-foreground shadow-md hover:border-amber-500/50'
                    : 'border-border bg-card/60 text-card-foreground opacity-80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                          ach.unlocked
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400'
                            : 'bg-muted border-border text-muted-foreground'
                        }`}
                      >
                        {ach.icon}
                      </div>

                      <div className="space-y-0.5 text-left">
                        <h4 className="text-sm font-bold text-card-foreground font-serif">{ach.title}</h4>
                        <p className="text-[11px] text-muted-foreground font-sans">{ach.description}</p>
                      </div>
                    </div>

                    {ach.unlocked ? (
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] shrink-0 font-mono">
                        +{ach.xp} XP
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground border border-border text-[10px] shrink-0 font-mono">
                        Locked
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Progress & Status */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex justify-between items-center text-[11px] font-mono text-muted-foreground">
                    <span>
                      {ach.unlocked ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3.5 h-3.5" />
                          Unlocked {ach.unlockedAt}
                        </span>
                      ) : (
                        <span>Progress: {currentVal} / {ach.maxProgress}</span>
                      )}
                    </span>
                    <span className="text-amber-500 dark:text-amber-400 font-bold">{progressPercent}%</span>
                  </div>

                  <Progress value={progressPercent} className="h-1.5 bg-muted border-none rounded-full" />
                </div>
              </Card>
            </motion.div>
          )
        })}
      </section>
    </main>
  )
})

AchievementsPage.displayName = 'AchievementsPage'

export default AchievementsPage
