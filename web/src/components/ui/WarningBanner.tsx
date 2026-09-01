import React from 'react'
import { AlertTriangle, Info } from 'lucide-react'

export interface WarningBannerProps {
  title: string
  description: string
  type?: 'warning' | 'info'
  className?: string
}

export const WarningBanner: React.FC<WarningBannerProps> = ({
  title,
  description,
  type = 'warning',
  className = '',
}) => {
  const isWarning = type === 'warning'
  const border = isWarning ? 'border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 text-card-foreground' : 'border-violet-500/30 bg-violet-500/10 dark:bg-violet-950/20 text-card-foreground'
  const iconColor = isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-violet-600 dark:text-violet-400'
  const Icon = isWarning ? AlertTriangle : Info

  return (
    <div className={`rounded-2xl border ${border} p-5 sm:p-6 text-left flex items-start gap-4 backdrop-blur-md shadow-md ${className}`}>
      <div className={`p-2 rounded-xl bg-muted/40 ${iconColor} shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-card-foreground font-serif">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed font-sans">{description}</p>
      </div>
    </div>
  )
}

export default WarningBanner
