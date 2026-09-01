import React from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { Sun01Icon, Moon01Icon } from '@hugeicons/core-free-icons'

import { useThemeStore } from '@/stores/useThemeStore'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'

export interface ThemeToggleProps {
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = React.memo(({ className = '' }) => {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <Card className={`p-4 rounded-2xl border border-border bg-card text-card-foreground backdrop-blur-xl flex items-center justify-between shadow-md text-left select-none hover:border-amber-500/40 transition-colors ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400">
          <HugeiconsIcon icon={isDark ? Moon01Icon : Sun01Icon} className="w-4 h-4 text-violet-500 dark:text-violet-400" />
        </div>
        <div>
          <h5 className="text-xs font-bold text-card-foreground font-serif">
            Interface Theme
          </h5>
          <p className="text-[11px] text-muted-foreground">
            {isDark ? 'Dark mode enabled' : 'Light mode enabled'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Switch
            checked={isDark}
            onCheckedChange={toggleTheme}
            aria-label="Toggle dark/light interface theme"
            className="data-[state=checked]:bg-violet-600 data-[state=unchecked]:bg-amber-400 cursor-pointer"
          />
        </motion.div>
      </div>
    </Card>
  )
})

ThemeToggle.displayName = 'ThemeToggle'

export default ThemeToggle
