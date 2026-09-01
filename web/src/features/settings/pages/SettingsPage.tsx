import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { Settings02Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { ProfileEditForm } from '../components/ProfileEditForm'
import { NotificationToggle } from '../components/NotificationToggle'
import { ThemeSelector } from '../components/ThemeSelector'
import { PrivacyOptions } from '../components/PrivacyOptions'

export interface SettingsPageProps {
  className?: string
}

export const SettingsPage: React.FC<SettingsPageProps> = React.memo(({ className = '' }) => {
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
    <main className={`min-h-screen bg-background text-foreground transition-colors duration-250 pb-16 pt-3 sm:pt-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 select-none font-sans relative ${className}`}>
      {/* Background Layered Soft Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-violet-600/5 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants as any}
        className="space-y-8"
      >
        {/* ── 1. Page Settings Header Bar ── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 text-left">
          <div className="flex items-start gap-3.5 z-10">
            <div className="w-11 h-11 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0 shadow-md mt-1">
              <HugeiconsIcon icon={Settings02Icon} className="w-5 h-5 text-violet-400" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-serif">
                Settings
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-sans max-w-md leading-relaxed">
                Manage your profile, preferences, appearance, and privacy settings.
              </p>
            </div>
          </div>

          {/* Account Status Badge */}
          <div className="self-start sm:self-center shrink-0 z-10">
            <Badge
              variant="outline"
              className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-xs"
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Profile Synced</span>
            </Badge>
          </div>
        </header>

        {/* ── 2. Main 12-Column Responsive Resource Grid ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Column: Personal Profile Details Form (Span 7 of 12) */}
          <section className="lg:col-span-7 w-full h-full flex flex-col justify-between" aria-label="Personal Profile Details">
            <ProfileEditForm className="w-full h-full flex-1" />
          </section>

          {/* Right Column: Appearance & Notifications Stack (Span 5 of 12) */}
          <section className="lg:col-span-5 w-full h-full flex flex-col justify-between space-y-6" aria-label="Appearance & Notification Preferences">
            <ThemeSelector className="w-full flex-1" />
            <NotificationToggle className="w-full shrink-0" />
          </section>
        </motion.div>

        {/* ── 3. Data Privacy & Account Controls (Col Span 12) ── */}
        <motion.section variants={itemVariants} aria-label="Data Privacy & Account Controls">
          <PrivacyOptions className="w-full" />
        </motion.section>
      </motion.div>
    </main>
  )
})

SettingsPage.displayName = 'SettingsPage'

export default SettingsPage
