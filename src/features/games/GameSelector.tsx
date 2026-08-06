import { MAIN_GAME_CONTEXTS, type MainGameSlug } from './gameCatalog'
import { useGameContext } from './useGameContext'

export function GameSelector() {
  const { game, setGame } = useGameContext()

  return (
    <label className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
      <span className="sr-only sm:not-sr-only">Juego</span>
      <select
        aria-label="Juego activo"
        value={game.slug}
        onChange={(event) => setGame(event.target.value as MainGameSlug)}
        className="h-9 min-w-0 max-w-36 rounded-md border border-input bg-background px-2 text-sm text-foreground sm:max-w-44"
      >
        {MAIN_GAME_CONTEXTS.map((entry) => (
          <option key={entry.slug} value={entry.slug}>
            {entry.shortTitle} · Gen {entry.generation === 4 ? 'IV' : 'V'}
          </option>
        ))}
      </select>
    </label>
  )
}
