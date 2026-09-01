import React, { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Shield02Icon,
  Download01Icon,
  Delete02Icon,
  InformationCircleIcon,
  Alert02Icon,
} from '@hugeicons/core-free-icons'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

export interface PrivacyOptionsProps {
  className?: string
}

export const PrivacyOptions: React.FC<PrivacyOptionsProps> = React.memo(({ className = '' }) => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <Card className={`overflow-hidden rounded-lg border-border bg-card shadow-xl text-left transition-colors duration-250 ${className}`}>
      <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border bg-muted/30 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 shadow-md">
            <HugeiconsIcon icon={Shield02Icon} className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-foreground font-serif">
              Data Privacy & Account Controls
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Action 1: Export Data */}
          <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5 font-serif">
                <HugeiconsIcon icon={Download01Icon} className="w-4 h-4 text-violet-500" />
                <span>Request Data Export</span>
              </h5>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                Download a complete archive of your mood logs, journal entries, and chat history.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setExportDialogOpen(true)}
              className="h-9 px-4 text-xs font-semibold bg-background border-border text-foreground hover:bg-muted rounded-lg gap-2 cursor-pointer w-full"
            >
              <HugeiconsIcon icon={Download01Icon} className="w-3.5 h-3.5 text-violet-500" />
              <span>Export Archive</span>
            </Button>
          </div>

          {/* Action 2: Delete Account */}
          <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/20 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 font-serif">
                <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Delete Account</span>
              </h5>
              <p className="text-[11px] text-rose-800/80 dark:text-rose-200/70 leading-relaxed font-sans">
                Permanently purge your account, data entries, and companion session history.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              className="h-9 px-4 text-xs font-semibold bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 dark:hover:bg-rose-500/30 rounded-xl gap-2 cursor-pointer w-full transition-colors"
            >
              <HugeiconsIcon icon={Delete02Icon} className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Delete Account</span>
            </Button>
          </div>
        </div>

        {/* ── Dialog 1: Data Export Future Feature Dialog ── */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent className="bg-card border-border text-card-foreground max-w-md rounded-2xl p-6">
            <DialogHeader className="space-y-2 text-left">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400">
                <HugeiconsIcon icon={InformationCircleIcon} className="w-5 h-5 text-violet-500 dark:text-violet-400" />
              </div>
              <DialogTitle className="text-lg font-bold font-serif text-card-foreground">
                Data Export Coming Soon
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed font-sans">
                Comprehensive JSON and CSV data export functionality will be available in an upcoming Kintsugi platform update. Your privacy remains completely secured.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="pt-4">
              <Button
                onClick={() => setExportDialogOpen(false)}
                className="w-full sm:w-auto h-9 px-5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl"
              >
                Got It
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Dialog 2: Account Deletion Future Feature Dialog ── */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-card border-rose-500/30 text-card-foreground max-w-md rounded-2xl p-6">
            <DialogHeader className="space-y-2 text-left">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 dark:text-rose-400">
                <HugeiconsIcon icon={Alert02Icon} className="w-5 h-5 text-rose-500 dark:text-rose-400" />
              </div>
              <DialogTitle className="text-lg font-bold font-serif text-rose-600 dark:text-rose-300">
                Account Deletion Request
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed font-sans">
                Automated account purge services will become available once backend data governance endpoints are enabled. To request manual account removal, please contact support.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                className="w-full sm:w-auto h-9 px-5 bg-background border-border text-foreground hover:bg-muted text-xs rounded-xl"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
})

PrivacyOptions.displayName = 'PrivacyOptions'

export default PrivacyOptions
