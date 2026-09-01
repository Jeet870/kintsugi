import React from 'react'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/GlassCard'

export interface TechCardProps {
  name: string
  category: string
  badge: string
  description: string
  whyChosen: string
  architectureRole: string
  icon: React.ElementType
}

export const TechCard: React.FC<TechCardProps> = ({
  name,
  category,
  badge,
  description,
  whyChosen,
  architectureRole,
  icon: Icon,
}) => {
  return (
    <GlassCard accentColor="purple" className="space-y-4 text-left rounded-2xl border-border bg-card text-card-foreground hover:border-amber-500/40 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400">
            <Icon className="w-5 h-5 text-violet-500 dark:text-violet-400" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-card-foreground font-serif">{name}</h4>
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">{category}</span>
          </div>
        </div>
        <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] px-2.5 py-0.5 border border-border">
          {badge}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>

      <div className="space-y-2 pt-2 border-t border-border text-xs">
        <div>
          <span className="text-violet-600 dark:text-violet-400 font-semibold">Why Chosen: </span>
          <span className="text-muted-foreground">{whyChosen}</span>
        </div>
        <div>
          <span className="text-amber-600 dark:text-amber-400 font-semibold">Architecture Role: </span>
          <span className="text-muted-foreground">{architectureRole}</span>
        </div>
      </div>
    </GlassCard>
  )
}

export default TechCard
