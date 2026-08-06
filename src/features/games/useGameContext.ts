import { createContext, useContext } from 'react'
import type { MainGameContext, MainGameSlug } from './gameCatalog'

export interface GameContextValue {
  game: MainGameContext
  setGame: (slug: MainGameSlug) => void
}

export const GameContext = createContext<GameContextValue | null>(null)

export function useGameContext(): GameContextValue {
  const value = useContext(GameContext)
  if (value == null) throw new Error('useGameContext debe usarse dentro de GameProvider')
  return value
}
