import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

import { ProfileHeader } from '../components/ProfileHeader'
import { MoodStreakCard } from '../components/MoodStreakCard'
import { AchievementBadgeGrid } from '../components/AchievementBadgeGrid'
import { MoodStatsChart } from '../components/MoodStatsChart'
import { ThemeToggle } from '../components/ThemeToggle'

export interface ProfilePageProps {
  className?: string
}

export const ProfilePage: React.FC<ProfilePageProps> = React.memo(({ className = '' }) => {
  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 12 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.35,
          ease: 'easeOut',
          staggerChildren: 0.1,
        },
      },
    }),
    [],
  )

  const itemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 8 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    }),
    [],
  )

  return (
    <main className={`min-h-screen bg-background text-foreground pb-16 pt-3 sm:pt-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 select-none font-sans relative ${className}`}>
      {/* Background Soft Layered Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-violet-600/5 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants as any}
        className="space-y-8"
      >
        {/* ── 1. Hero Profile Header (Col Span 12) ── */}
        <motion.section variants={itemVariants} aria-label="User Profile Header">
          <ProfileHeader className="w-full" />
        </motion.section>

        {/* ── 2. Mood Streak & Achievements Section (Col Span 4 & Col Span 8) ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Mood Streak Card (Span 4 of 12) */}
          <section className="lg:col-span-4 w-full h-full flex flex-col justify-between" aria-label="Wellness Check-In Streak">
            <MoodStreakCard className="w-full h-full flex-1" />
          </section>

          {/* Achievement Badge Grid (Span 8 of 12) */}
          <section className="lg:col-span-8 w-full h-full flex flex-col justify-between" aria-label="Earned Milestones & Badges">
            <AchievementBadgeGrid className="w-full h-full flex-1" />
          </section>
        </motion.div>

        {/* ── 3. Mood Distribution Statistics Chart (Col Span 12) ── */}
        <motion.section variants={itemVariants} aria-label="Mood Distribution Statistics">
          <MoodStatsChart className="w-full" />
        </motion.section>

        {/* ── 4. Theme & Interface Preferences (Col Span 12) ── */}
        <motion.section variants={itemVariants} aria-label="Interface Preferences">
          <ThemeToggle className="w-full" />
        </motion.section>
      </motion.div>
    </main>
  )
})

ProfilePage.displayName = 'ProfilePage'

export default ProfilePage
