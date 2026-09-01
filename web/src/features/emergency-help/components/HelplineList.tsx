import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Shield02Icon,
  CallIcon,
  Globe02Icon,
  RotateLeftIcon,
  Copy01Icon,
  CheckmarkCircle02Icon,
  HeadphonesIcon,
  HeartIcon,
  Leaf01Icon,
  ArrowDown01Icon,
} from '@hugeicons/core-free-icons'

import { useHelplines } from '@/features/emergency-help/hooks/useHelplines'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface HelplineListProps {
  countryCode?: string
  className?: string
}

export const HelplineList: React.FC<HelplineListProps> = React.memo(
  ({ countryCode = 'IN', className = '' }) => {
    const [selectedRegion, setSelectedRegion] = useState<string>(countryCode || 'ALL')
    const [showAll, setShowAll] = useState(false)
    const targetCountry = selectedRegion === 'ALL' ? undefined : selectedRegion
    const { data: helplinesData, isLoading, isError, error, refetch } = useHelplines({ countryCode: targetCountry })
    const [copiedId, setCopiedId] = useState<string | number | null>(null)

    const rawHelplines = helplinesData ?? []
    const visibleHelplines = showAll ? rawHelplines : rawHelplines.slice(0, 3)

    const handleCopyNumber = (id: string | number, phoneNumber: string, name: string) => {
      navigator.clipboard.writeText(phoneNumber)
      setCopiedId(id)
      toast.success('Number copied to clipboard', {
        description: `${name}: ${phoneNumber}`,
      })
      setTimeout(() => setCopiedId(null), 2500)
    }

    const getItemIcon = (idx: number) => {
      const icons = [HeadphonesIcon, HeartIcon, Leaf01Icon]
      return icons[idx % icons.length]
    }

    return (
      <Card className={`overflow-hidden border border-border bg-card text-card-foreground shadow-xl text-left rounded-2xl h-full flex flex-col justify-between hover:border-amber-500/40 transition-colors ${className}`}>
        {/* Header: Title, Subtitle, & Region Filter Dropdown */}
        <CardHeader className="p-5 sm:p-6 pb-4 border-b border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0 shadow-md">
              <HugeiconsIcon icon={Shield02Icon} className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-base sm:text-lg font-bold text-card-foreground font-serif">
                Confidential Emergency Helplines
              </CardTitle>
              <p className="text-xs text-muted-foreground font-sans">
                Reach out to trusted organizations for immediate support.
              </p>
            </div>
          </div>

          <div className="w-36 shrink-0">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full h-9 text-xs bg-background border border-border text-foreground rounded-xl px-2.5 gap-1.5 cursor-pointer hover:border-amber-500/50 transition-colors">
                <HugeiconsIcon icon={Globe02Icon} className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All India" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border text-card-foreground">
                <SelectItem value="ALL">All India</SelectItem>
                <SelectItem value="IN">India (IN)</SelectItem>
                <SelectItem value="US">United States (US)</SelectItem>
                <SelectItem value="UK">United Kingdom (UK)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-3.5 flex-1 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* ── State 1: Loading Skeleton Placeholders ── */}
            {isLoading && !helplinesData && (
              <motion.div
                key="loading-helplines"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-muted/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="w-40 h-5 bg-muted" />
                      <Skeleton className="w-24 h-8 rounded-lg bg-muted" />
                    </div>
                    <Skeleton className="w-full h-4 bg-muted/60" />
                  </div>
                ))}
              </motion.div>
            )}

            {/* ── State 2: Error State ── */}
            {isError && !isLoading && (
              <motion.div
                key="error-helplines"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-5 text-center space-y-3 bg-rose-500/10 border border-rose-500/20 rounded-xl"
              >
                <p className="text-xs text-rose-600 dark:text-rose-300">
                  Failed to load helpline directory: {error?.message || 'Network connection issue.'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="h-8 text-xs bg-background border-border text-foreground gap-1.5 cursor-pointer rounded-xl"
                >
                  <HugeiconsIcon icon={RotateLeftIcon} className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Retry Connection</span>
                </Button>
              </motion.div>
            )}

            {/* ── State 3: Empty State ── */}
            {!isLoading && !isError && rawHelplines.length === 0 && (
              <motion.div
                key="empty-helplines"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4"
              >
                <EmptyState
                  icon={<HugeiconsIcon icon={Shield02Icon} className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />}
                  title="No Helplines Found"
                  description="No specific emergency helplines match the selected country region."
                  size="sm"
                />
              </motion.div>
            )}

            {/* ── State 4: Populated Helplines List ── */}
            {!isLoading && !isError && rawHelplines.length > 0 && (
              <div className="space-y-3">
                <motion.div
                  key="helplines-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {visibleHelplines.map((item, idx) => {
                    const is24x7 = item.is_24_7 ?? true
                    const phoneClean = item.phone_number.replace(/[^0-9+]/g, '')
                    const itemId = item.id || idx
                    const isCopied = copiedId === itemId
                    const ItemIcon = getItemIcon(idx)

                    return (
                      <motion.div
                        key={itemId}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.04 }}
                      >
                        <Card className="p-4 sm:p-4.5 rounded-xl border border-border bg-muted/30 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                          {/* Item Left: Icon + Title + Description */}
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5">
                              <HugeiconsIcon icon={ItemIcon} className="w-5 h-5" />
                            </div>

                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-card-foreground font-serif">
                                  {item.organization_name}
                                </h4>
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-mono font-medium">
                                  {item.availability || (is24x7 ? '24/7 Support' : 'Active')}
                                </span>
                              </div>

                              <p className="text-xs text-muted-foreground leading-relaxed font-sans line-clamp-2">
                                {item.description || 'Confidential support and crisis care.'}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons: Copy + Phone Dialer */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyNumber(itemId, item.phone_number, item.organization_name)}
                              aria-label={`Copy phone number for ${item.organization_name}`}
                              className="h-10 px-3.5 rounded-xl bg-background border border-border text-foreground hover:bg-muted text-xs gap-1.5 cursor-pointer transition-colors"
                            >
                              <HugeiconsIcon
                                icon={isCopied ? CheckmarkCircle02Icon : Copy01Icon}
                                className={`w-3.5 h-3.5 ${isCopied ? 'text-emerald-500' : 'text-muted-foreground'}`}
                              />
                              <span>{isCopied ? 'Copied' : 'Copy'}</span>
                            </Button>

                            <a
                              href={`tel:${phoneClean}`}
                              aria-label={`Call ${item.organization_name} at ${item.phone_number}`}
                              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
                            >
                              <HugeiconsIcon icon={CallIcon} className="w-3.5 h-3.5 text-white" />
                              <span>{item.phone_number}</span>
                            </a>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </motion.div>

                {/* View More Helplines Toggle Button */}
                {rawHelplines.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAll((prev) => !prev)}
                    className="w-full py-2.5 rounded-xl bg-muted/60 hover:bg-muted border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{showAll ? 'View Less Helplines' : 'View More Helplines'}</span>
                    <HugeiconsIcon
                      icon={ArrowDown01Icon}
                      className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                        showAll ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                )}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    )
  },
)

HelplineList.displayName = 'HelplineList'

export default HelplineList

