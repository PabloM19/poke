import { createContext, useContext } from 'react'
import type { GameSelection, MainGameContext } from './gameCatalog'

export interface GameContextValue {
  /** The selected game context. When isAll is true this is a safe fallback for legacy tools. */
  game: MainGameContext
  selection: GameSelection
  isAll: boolean
  setGame: (selection: GameSelection) => void
}

export const GameContext = createContext<GameContextValue | null>(null)

export function useGameContext(): GameContextValue {
  const value = useContext(GameContext)
  if (value == null) throw new Error('useGameContext debe usarse dentro de GameProvider')
  return value
}

/**
 * Permite que componentes de presentación sigan siendo renderizables de forma
 * aislada (por ejemplo en storybooks y tests), sin crear una segunda fuente de
 * verdad. En la aplicación siempre existe GameProvider.
 */
export function useOptionalGameContext(): GameContextValue | null {
  return useContext(GameContext)
}
