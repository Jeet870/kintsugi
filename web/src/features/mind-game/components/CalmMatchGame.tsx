import React, { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Leaf01Icon,
  Sun01Icon,
  Moon01Icon,
  HeartIcon,
  SparklesIcon,
  Compass01Icon,
  RotateLeftIcon,
  Shield02Icon,
  FlowerIcon,
} from '@hugeicons/core-free-icons'

import { useCalmMatchGame, type MatchCard } from '@/features/mind-game/hooks/useCalmMatchGame'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface CalmMatchGameProps {
  className?: string
}

/**
 * Mapping helper binding card symbol strings to HugeIcons components.
 */
function getSymbolIcon(symbol: string) {
  switch (symbol) {
    case 'leaf':
      return Leaf01Icon
    case 'sun':
      return Sun01Icon
    case 'moon':
      return Moon01Icon
    case 'heart':
      return HeartIcon
    case 'sparkles':
      return SparklesIcon
    case 'flower':
      return FlowerIcon
    case 'wave':
    case 'stone':
    default:
      return Compass01Icon
  }
}

export const CalmMatchGame: React.FC<CalmMatchGameProps> = React.memo(({ className = '' }) => {
  const {
    cards,
    matchedCards,
    isCompleted,
    isLocked,
    flipCard,
    restartGame,
  } = useCalmMatchGame()

  const handleCardClick = useCallback(
    (cardId: string) => {
      flipCard(cardId)
    },
    [flipCard],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, cardId: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        flipCard(cardId)
      }
    },
    [flipCard],
  )

  return (
    <Card className={`overflow-hidden rounded-2xl border border-amber-500/30 bg-card text-card-foreground backdrop-blur-2xl shadow-xl text-left select-none relative ${className}`}>
      {/* Soft Kintsugi Gold Halo Glow */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <CardHeader className="p-5 sm:p-6 pb-4 border-b border-border bg-muted/40 flex flex-row items-center justify-between space-y-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-md">
            <HugeiconsIcon icon={SparklesIcon} className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-card-foreground font-serif">
              Mindful Memory Match
            </CardTitle>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono text-xs font-semibold px-2.5 py-0.5">
            {matchedCards.length / 2} / {cards.length / 2} Pairs
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={restartGame}
            aria-label="Restart Mind Game"
            className="h-8 px-3 border-border bg-background text-foreground hover:bg-muted rounded-xl text-xs gap-1.5 cursor-pointer transition-colors"
          >
            <HugeiconsIcon icon={RotateLeftIcon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-8 space-y-6 relative z-10">
        {/* Memory Cards Responsive Grid (3 rows of 4 = 12 cards) */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3.5 max-w-md sm:max-w-lg mx-auto w-full">
          {cards.map((card: MatchCard) => {
            const IconComponent = getSymbolIcon(card.symbol)
            const isFlippedOrMatched = card.isFlipped || card.isMatched

            const ariaLabel = card.isMatched
              ? `Matched ${card.symbol} card`
              : card.isFlipped
                ? `Flipped ${card.symbol} card`
                : 'Hidden card'

            return (
              <div
                key={card.id}
                tabIndex={isLocked || isFlippedOrMatched ? -1 : 0}
                role="button"
                aria-label={ariaLabel}
                aria-disabled={isLocked || isFlippedOrMatched}
                onClick={() => handleCardClick(card.id)}
                onKeyDown={(e) => handleKeyDown(e, card.id)}
                className="aspect-square cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/50 rounded-2xl"
                style={{ perspective: 1000 }}
              >
                <motion.div
                  className="w-full h-full relative rounded-2xl shadow-md cursor-pointer"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: isFlippedOrMatched ? 180 : 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  {/* Card Front (Face-Down / Hidden State) */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-2xl border border-border bg-muted/60 flex items-center justify-center text-muted-foreground shadow-sm hover:border-amber-500/50 transition-all"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <HugeiconsIcon icon={Shield02Icon} className="w-6 h-6 opacity-60" />
                  </div>

                  {/* Card Back (Face-Up / Revealed State) */}
                  <div
                    className={`absolute inset-0 w-full h-full rounded-2xl border flex items-center justify-center transition-all ${
                      card.isMatched
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 shadow-emerald-500/10'
                        : 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-300'
                    }`}
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <HugeiconsIcon icon={IconComponent} className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" />
                  </div>
                </motion.div>
              </div>
            )
          })}
        </div>

        {/* Completion Message Overlay */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="p-6 sm:p-7 rounded-2xl border border-amber-500/40 bg-card/95 text-card-foreground text-center space-y-4 shadow-2xl backdrop-blur-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 dark:text-amber-300 mx-auto shadow-lg">
                <HugeiconsIcon icon={SparklesIcon} className="w-6 h-6 text-amber-500 dark:text-amber-400" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-foreground">
                  Wonderful.
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans max-w-md mx-auto">
                  You completed today's mindful exercise. Take a slow breath and notice how you feel.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={restartGame}
                  className="h-11 px-6 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 border border-amber-300/40 gap-2 cursor-pointer min-h-[44px]"
                >
                  <HugeiconsIcon icon={RotateLeftIcon} className="w-4 h-4 text-zinc-950" />
                  <span>Play Again</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
})

CalmMatchGame.displayName = 'CalmMatchGame'

export default CalmMatchGame
