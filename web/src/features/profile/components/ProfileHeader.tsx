import React from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { UserIcon, SparklesIcon, Calendar01Icon } from '@hugeicons/core-free-icons'

import { useProfile } from '@/features/profile/hooks/useProfile'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatShortDate } from '@/lib/utils/formatDate'

export interface ProfileHeaderProps {
  className?: string
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = React.memo(({ className = '' }) => {
  const { data: profileData, isLoading, isError } = useProfile()

  const user = profileData?.user
  const streak = profileData?.streak

  /* Derive initials fallback from name or email */
  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ')
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      return name.substring(0, 2).toUpperCase()
    }
    if (email) return email.substring(0, 2).toUpperCase()
    return 'U'
  }

  return (
    <Card className={`overflow-hidden rounded-2xl border-border bg-card text-card-foreground backdrop-blur-2xl shadow-xl text-left select-none relative hover:border-amber-500/40 transition-colors ${className}`}>
      {/* Soft Background Radial Glow */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-32 bg-violet-600/10 blur-3xl pointer-events-none" />

      <CardContent className="p-6 sm:p-8 relative z-10">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <Skeleton className="w-20 h-20 rounded-full bg-muted shrink-0" />
            <div className="space-y-2.5 text-center sm:text-left flex-1 w-full">
              <Skeleton className="w-48 h-7 bg-muted mx-auto sm:mx-0" />
              <Skeleton className="w-32 h-4 bg-muted mx-auto sm:mx-0" />
              <Skeleton className="w-full h-4 bg-muted/60 max-w-sm mx-auto sm:mx-0" />
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <EmptyState
            icon={<HugeiconsIcon icon={UserIcon} className="w-8 h-8 text-violet-500 dark:text-violet-400" />}
            title="Profile Unavailable"
            description="Unable to load user profile details right now."
            size="sm"
          />
        )}

        {/* Loaded Profile Content */}
        {!isLoading && !isError && user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left"
          >
            {/* Avatar with Custom Image or Fallback Initials */}
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-violet-500/30 shadow-xl ring-4 ring-violet-500/10 shrink-0">
              <AvatarImage src={user.avatar_url || undefined} alt={user.name || 'User Avatar'} />
              <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-800 text-white font-bold text-xl sm:text-2xl font-serif">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-card-foreground font-serif tracking-tight">
                  {user.name || user.email.split('@')[0]}
                </h2>
                <Badge
                  variant="secondary"
                  className="bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-300 text-[10px] font-mono capitalize px-2.5 py-0.5"
                >
                  {user.role || 'Member'}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground font-sans">
                {user.email}
              </p>

              {/* Encouraging Wellness Summary Banner */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs font-mono text-muted-foreground">
                {streak && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold">
                    <HugeiconsIcon icon={SparklesIcon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>{streak.current_streak} Day Active Streak</span>
                  </span>
                )}
                {user.created_at && (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground text-[11px]">
                    <HugeiconsIcon icon={Calendar01Icon} className="w-3.5 h-3.5" />
                    <span>Member since {formatShortDate(user.created_at)}</span>
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
})

ProfileHeader.displayName = 'ProfileHeader'

export default ProfileHeader
