import { useState, type ReactNode } from 'react'
import { getStored, setStored } from '@/lib/storage'
import {
  DEFAULT_MAIN_GAME_SLUG,
  ALL_GAMES_SLUG,
  getMainGameContext,
  isGameSelection,
  type GameSelection,
} from './gameCatalog'
import { GameContext } from './useGameContext'

const STORAGE_KEY = 'game-context:v1'

interface StoredGameContext {
  version: 1
  slug: GameSelection
}

function readInitialSelection(): GameSelection {
  const stored = getStored<Partial<StoredGameContext>>(STORAGE_KEY)
  return stored?.version === 1 && isGameSelection(stored.slug)
    ? stored.slug
    : DEFAULT_MAIN_GAME_SLUG
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<GameSelection>(readInitialSelection)

  const setGame = (nextSelection: GameSelection) => {
    setSelection(nextSelection)
    setStored<StoredGameContext>(STORAGE_KEY, { version: 1, slug: nextSelection })
  }

  const isAll = selection === ALL_GAMES_SLUG
  const game = getMainGameContext(isAll ? DEFAULT_MAIN_GAME_SLUG : selection)

  return (
    <GameContext.Provider value={{ game, selection, isAll, setGame }}>
      {children}
    </GameContext.Provider>
  )
}
