import { useState, useCallback, useMemo } from 'react'

export interface MatchCard {
  readonly id: string
  readonly pairId: string
  readonly symbol: string
  readonly isFlipped: boolean
  readonly isMatched: boolean
}

export interface UseCalmMatchGameOptions {
  pairSymbols?: readonly string[]
  mismatchDelayMs?: number
}

export interface UseCalmMatchGameReturn {
  cards: readonly MatchCard[]
  flippedCards: readonly MatchCard[]
  matchedCards: readonly MatchCard[]
  isCompleted: boolean
  moves: number
  isLocked: boolean
  flipCard: (cardId: string) => void
  restartGame: () => void
}

const DEFAULT_CALM_SYMBOLS = [
  'leaf',
  'sun',
  'moon',
  'heart',
  'sparkles',
  'flower',
] as const

/**
 * Perform an unbiased Fisher–Yates in-place shuffle.
 */
function fisherYatesShuffle<T>(array: readonly T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }
  return shuffled
}

/**
 * Helper to generate a fresh, shuffled set of matching card pairs.
 */
function createShuffledDeck(symbols: readonly string[]): MatchCard[] {
  const deck: MatchCard[] = []

  symbols.forEach((sym, idx) => {
    const pairId = `pair-${sym}-${idx}`
    deck.push({
      id: `${pairId}-a`,
      pairId,
      symbol: sym,
      isFlipped: false,
      isMatched: false,
    })
    deck.push({
      id: `${pairId}-b`,
      pairId,
      symbol: sym,
      isFlipped: false,
      isMatched: false,
    })
  })

  return fisherYatesShuffle(deck)
}

/**
 * Custom React Hook managing the state machine for a low-stimulation, untimed memory matching game.
 *
 * Designed for gentle focus, mindfulness, and relaxation.
 */
export function useCalmMatchGame(options?: UseCalmMatchGameOptions): UseCalmMatchGameReturn {
  const symbols = options?.pairSymbols ?? DEFAULT_CALM_SYMBOLS
  const mismatchDelayMs = options?.mismatchDelayMs ?? 700

  /* 1. Primary game deck state */
  const [cards, setCards] = useState<readonly MatchCard[]>(() => createShuffledDeck(symbols))

  /* 2. Currently flipped un-matched card IDs in active turn (max 2) */
  const [flippedIds, setFlippedIds] = useState<readonly string[]>([])

  /* 3. Lock interaction during evaluation delay */
  const [isLocked, setIsLocked] = useState<boolean>(false)

  /* 4. Total pair attempts count (informational) */
  const [moves, setMoves] = useState<number>(0)

  /* Derived states */
  const flippedCards = useMemo(
    () => cards.filter((c) => flippedIds.includes(c.id)),
    [cards, flippedIds],
  )

  const matchedCards = useMemo(
    () => cards.filter((c) => c.isMatched),
    [cards],
  )

  const isCompleted = useMemo(
    () => cards.length > 0 && matchedCards.length === cards.length,
    [cards, matchedCards],
  )

  /* Card Flip Logic */
  const flipCard = useCallback(
    (cardId: string) => {
      /* Ignore interaction if board is locked, or card already flipped/matched */
      if (isLocked) return

      const targetCard = cards.find((c) => c.id === cardId)
      if (!targetCard || targetCard.isFlipped || targetCard.isMatched) return

      if (flippedIds.length === 0) {
        /* Flip 1st card in turn */
        setFlippedIds([cardId])
        setCards((prev) =>
          prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)),
        )
      } else if (flippedIds.length === 1 && flippedIds[0] !== cardId) {
        /* Flip 2nd card in turn */
        const firstCardId = flippedIds[0]
        const firstCard = cards.find((c) => c.id === firstCardId)

        if (!firstCard) return

        setFlippedIds([firstCardId, cardId])
        setCards((prev) =>
          prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)),
        )
        setMoves((prev) => prev + 1)

        /* Evaluate Pair Match */
        if (firstCard.pairId === targetCard.pairId) {
          /* Match Found: keep face-up permanently */
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === targetCard.pairId
                ? { ...c, isFlipped: true, isMatched: true }
                : c,
            ),
          )
          setFlippedIds([])
        } else {
          /* Mismatch: Lock interaction and flip back after brief delay */
          setIsLocked(true)
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstCardId || c.id === cardId
                  ? { ...c, isFlipped: false }
                  : c,
              ),
            )
            setFlippedIds([])
            setIsLocked(false)
          }, mismatchDelayMs)
        }
      }
    },
    [cards, flippedIds, isLocked, mismatchDelayMs],
  )

  /* Restart Game Logic */
  const restartGame = useCallback(() => {
    setCards(createShuffledDeck(symbols))
    setFlippedIds([])
    setIsLocked(false)
    setMoves(0)
  }, [symbols])

  return {
    cards,
    flippedCards,
    matchedCards,
    isCompleted,
    moves,
    isLocked,
    flipCard,
    restartGame,
  }
}

export default useCalmMatchGame
