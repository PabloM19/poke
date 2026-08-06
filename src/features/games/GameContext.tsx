import { useState, type ReactNode } from 'react'
import { getStored, setStored } from '@/lib/storage'
import {
  DEFAULT_MAIN_GAME_SLUG,
  getMainGameContext,
  isMainGameSlug,
  type MainGameSlug,
} from './gameCatalog'
import { GameContext } from './useGameContext'

const STORAGE_KEY = 'game-context:v1'

interface StoredGameContext {
  version: 1
  slug: MainGameSlug
}

function readInitialSlug(): MainGameSlug {
  const stored = getStored<Partial<StoredGameContext>>(STORAGE_KEY)
  return stored?.version === 1 && isMainGameSlug(stored.slug)
    ? stored.slug
    : DEFAULT_MAIN_GAME_SLUG
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [slug, setSlug] = useState<MainGameSlug>(readInitialSlug)

  const setGame = (nextSlug: MainGameSlug) => {
    setSlug(nextSlug)
    setStored<StoredGameContext>(STORAGE_KEY, { version: 1, slug: nextSlug })
  }

  return (
    <GameContext.Provider value={{ game: getMainGameContext(slug), setGame }}>
      {children}
    </GameContext.Provider>
  )
}
