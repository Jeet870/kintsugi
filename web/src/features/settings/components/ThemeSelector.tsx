import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Sun01Icon, Moon01Icon, ComputerIcon } from '@hugeicons/core-free-icons'

import { useThemeStore, type ThemeMode } from '@/stores/useThemeStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export interface ThemeSelectorProps {
  className?: string
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = React.memo(({ className = '' }) => {
  const { theme, setTheme } = useThemeStore()

  return (
    <Card className={`overflow-hidden rounded-lg border-border bg-card shadow-xl text-left h-full flex flex-col justify-between transition-colors duration-250 ${className}`}>
      <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border bg-muted/30 flex flex-row items-center justify-between space-y-0 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 shadow-md">
            <HugeiconsIcon icon={theme === 'light' ? Sun01Icon : theme === 'dark' ? Moon01Icon : ComputerIcon} className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-foreground font-serif">
              Visual Theme Preference
            </CardTitle>
          </div>
        </div>

        {/* Theme Select Dropdown */}
        <Select value={theme} onValueChange={(val) => setTheme(val as ThemeMode)}>
          <SelectTrigger className="h-9 px-3 bg-background border-border text-foreground focus:ring-violet-500/20 rounded-lg text-xs font-semibold w-auto min-w-[150px] shrink-0">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border text-popover-foreground">
            <SelectItem value="dark" className="text-xs focus:bg-muted">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Moon01Icon} className="w-3.5 h-3.5 text-violet-500" />
                <span>Dark Theme</span>
              </div>
            </SelectItem>
            <SelectItem value="light" className="text-xs focus:bg-muted">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Sun01Icon} className="w-3.5 h-3.5 text-amber-500" />
                <span>Light Theme</span>
              </div>
            </SelectItem>
            <SelectItem value="system" className="text-xs focus:bg-muted">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={ComputerIcon} className="w-3.5 h-3.5 text-blue-500" />
                <span>System Match</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        <p className="text-xs text-muted-foreground font-sans leading-relaxed">
          Customize the appearance of Kintsugi. Selecting Light or Dark overrides system defaults instantly without reloading the application.
        </p>

        {/* ── 3 Visual Theme Preview Cards Grid ── */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 pt-1">
          {/* 1. Dark Theme Preview */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`relative flex flex-col items-center gap-2 p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer text-left ${
              theme === 'dark'
                ? 'border-violet-500 bg-violet-950/20 ring-2 ring-violet-500/30'
                : 'border-border bg-muted/20 hover:border-violet-500/40'
            }`}
          >
            <div className="w-full h-14 rounded-lg bg-[#09090b] border border-white/10 p-2 flex flex-col justify-between overflow-hidden shadow-inner relative">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <div className="w-8 h-1 rounded bg-zinc-700" />
              </div>
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded bg-zinc-800" />
                <div className="w-2/3 h-1.5 rounded bg-zinc-800" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Moon01Icon} className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-semibold text-foreground font-serif">Dark</span>
            </div>
          </button>

          {/* 2. Light Theme Preview */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`relative flex flex-col items-center gap-2 p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer text-left ${
              theme === 'light'
                ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                : 'border-border bg-muted/20 hover:border-amber-500/40'
            }`}
          >
            <div className="w-full h-14 rounded-lg bg-[#f8fafc] border border-zinc-300 p-2 flex flex-col justify-between overflow-hidden shadow-inner relative">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <div className="w-8 h-1 rounded bg-zinc-300" />
              </div>
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded bg-zinc-200" />
                <div className="w-2/3 h-1.5 rounded bg-zinc-200" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Sun01Icon} className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-foreground font-serif">Light</span>
            </div>
          </button>

          {/* 3. System Match Preview (Diagonal Split) */}
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`relative flex flex-col items-center gap-2 p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer text-left ${
              theme === 'system'
                ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
                : 'border-border bg-muted/20 hover:border-blue-500/40'
            }`}
          >
            <div className="w-full h-14 rounded-lg border border-white/10 p-2 flex flex-col justify-between overflow-hidden shadow-inner relative bg-gradient-to-tr from-[#09090b] via-[#09090b] 50% to-[#f8fafc] 50%">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <div className="w-8 h-1 rounded bg-zinc-600" />
              </div>
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded bg-zinc-500/60" />
                <div className="w-2/3 h-1.5 rounded bg-zinc-500/60" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={ComputerIcon} className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-semibold text-foreground font-serif">System</span>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  )
})

ThemeSelector.displayName = 'ThemeSelector'

export default ThemeSelector
