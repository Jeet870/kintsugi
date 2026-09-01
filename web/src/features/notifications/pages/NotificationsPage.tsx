import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  BellIcon,
  SparklesIcon,
  Shield02Icon,
  HeartIcon,
  CheckmarkCircle02Icon,
  Delete01Icon,
  TickDouble01Icon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useClearAllNotifications,
} from '../hooks/useNotifications'

export const NotificationsPage: React.FC = React.memo(() => {
  const { data: notifications = [], isLoading } = useNotifications()
  const markReadMutation = useMarkNotificationRead()
  const markAllReadMutation = useMarkAllNotificationsRead()
  const deleteMutation = useDeleteNotification()
  const clearAllMutation = useClearAllNotifications()

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'wellness' | 'security'>('all')

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const isUnread = !(n.is_read || n.read)
      if (activeFilter === 'unread') return isUnread
      if (activeFilter === 'wellness') return n.category === 'wellness' || n.category === 'achievement'
      if (activeFilter === 'security') return n.category === 'security'
      return true
    })
  }, [notifications, activeFilter])

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !(n.is_read || n.read)).length
  }, [notifications])

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'security':
        return <HugeiconsIcon icon={Shield02Icon} className="w-4 h-4 text-teal-400" />
      case 'achievement':
        return <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-amber-400" />
      case 'wellness':
        return <HugeiconsIcon icon={HeartIcon} className="w-4 h-4 text-violet-400" />
      default:
        return <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 text-purple-400" />
    }
  }

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      if (diffMinutes < 1) return 'Just now'
      if (diffMinutes < 60) return `${diffMinutes}m ago`
      const diffHours = Math.floor(diffMinutes / 60)
      if (diffHours < 24) return `${diffHours}h ago`
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}d ago`
    } catch {
      return 'Recently'
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-purple-500/40 border-t-purple-400 rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-mono">Loading notifications…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-16 pt-3 sm:pt-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 select-none font-sans relative">
      {/* Ambient Background Soft Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-purple-600/5 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* ── 1. Hero Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 text-left">
        <div className="flex items-start gap-3.5 z-10">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0 shadow-md mt-1">
            <HugeiconsIcon icon={BellIcon} className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-serif">
                Notifications Center
              </h1>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40 text-xs font-mono">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans max-w-md leading-relaxed">
              Stay up to date with your emotional check-in reminders, security alerts, and milestone updates.
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0 z-10">
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="h-9 px-3 text-xs bg-background border-border text-foreground hover:bg-muted rounded-xl gap-1.5 cursor-pointer transition-colors"
            >
              <HugeiconsIcon icon={TickDouble01Icon} className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span>Mark All Read</span>
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => clearAllMutation.mutate()}
              disabled={clearAllMutation.isPending}
              className="h-9 px-3 text-xs bg-background border-border text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl gap-1.5 cursor-pointer transition-colors"
            >
              <HugeiconsIcon icon={Delete01Icon} className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </Button>
          )}
        </div>
      </header>

      {/* ── 2. Category Filter Tabs ── */}
      <section className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        <Button
          size="sm"
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveFilter('all')}
          className={`h-8 px-3.5 text-xs rounded-xl font-medium cursor-pointer transition-all ${
            activeFilter === 'all'
              ? 'bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-xs'
              : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          All ({notifications.length})
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'unread' ? 'default' : 'outline'}
          onClick={() => setActiveFilter('unread')}
          className={`h-8 px-3.5 text-xs rounded-xl font-medium cursor-pointer transition-all ${
            activeFilter === 'unread'
              ? 'bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-xs'
              : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'wellness' ? 'default' : 'outline'}
          onClick={() => setActiveFilter('wellness')}
          className={`h-8 px-3.5 text-xs rounded-xl font-medium cursor-pointer transition-all ${
            activeFilter === 'wellness'
              ? 'bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-xs'
              : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Wellness & Milestones
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'security' ? 'default' : 'outline'}
          onClick={() => setActiveFilter('security')}
          className={`h-8 px-3.5 text-xs rounded-xl font-medium cursor-pointer transition-all ${
            activeFilter === 'security'
              ? 'bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-xs'
              : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Security & Vault
        </Button>
      </section>

      {/* ── 3. Notifications List ── */}
      <section className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground">
                <HugeiconsIcon icon={BellIcon} className="w-6 h-6" />
              </div>
              <p className="text-sm text-muted-foreground font-sans">
                {activeFilter === 'unread' ? 'No unread notifications!' : 'No notifications in this category.'}
              </p>
            </motion.div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUnread = !(notif.is_read || notif.read)

              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={`p-4 rounded-2xl border transition-all ${
                      isUnread
                        ? 'border-purple-500/30 bg-card text-card-foreground shadow-md hover:border-amber-500/40'
                        : 'border-border bg-card/60 text-card-foreground opacity-90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 text-left">
                        <div className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0 mt-0.5">
                          {getCategoryIcon(notif.category)}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-card-foreground font-serif">
                              {notif.title}
                            </h4>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                            {notif.message || notif.body}
                          </p>
                          <span className="text-[10px] text-muted-foreground font-mono block">
                            {formatTimeAgo(notif.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isUnread && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => markReadMutation.mutate(notif.id)}
                            title="Mark as read"
                            className="w-8 h-8 text-muted-foreground hover:text-purple-500 hover:bg-purple-500/10 rounded-lg cursor-pointer transition-colors"
                          >
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(notif.id)}
                          title="Dismiss"
                          className="w-8 h-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
                        >
                          <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </section>
    </main>
  )
})

NotificationsPage.displayName = 'NotificationsPage'

export default NotificationsPage
