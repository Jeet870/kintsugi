import React from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { Notification01Icon } from '@hugeicons/core-free-icons'

import { useProfile } from '@/features/profile/hooks/useProfile'
import { useUpdateProfile } from '@/features/settings/hooks/useUpdateProfile'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'

export interface NotificationToggleProps {
  className?: string
}

export const NotificationToggle: React.FC<NotificationToggleProps> = React.memo(({ className = '' }) => {
  const { data: profileData, isLoading } = useProfile()
  const { mutate: updateProfile, isPending } = useUpdateProfile()

  const isEnabled = profileData?.user?.notification_enabled ?? true

  const handleToggle = (checked: boolean) => {
    updateProfile({
      notification_enabled: checked,
    })
  }

  return (
    <Card className={`p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-xl flex items-center justify-between text-left select-none transition-colors duration-250 hover:border-amber-500/40 ${className}`}>
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 shrink-0">
          <HugeiconsIcon icon={Notification01Icon} className="w-5 h-5 text-violet-500 dark:text-violet-400" />
        </div>
        <div className="space-y-0.5">
          <h5 className="text-sm font-bold text-foreground font-serif">
            Push & Wellness Reminders
          </h5>
          <p className="text-xs text-muted-foreground">
            Receive calming daily check-in reminders and milestone alerts.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="w-12 h-6 rounded-full bg-muted" />
      ) : (
        <motion.div whileTap={{ scale: 0.95 }}>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isPending}
            aria-label="Toggle push and wellness notifications"
            className="data-[state=checked]:bg-violet-600 data-[state=unchecked]:bg-muted cursor-pointer"
          />
        </motion.div>
      )}
    </Card>
  )
})

NotificationToggle.displayName = 'NotificationToggle'

export default NotificationToggle
