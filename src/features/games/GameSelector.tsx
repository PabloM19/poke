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
        className="h-11 min-w-0 max-w-40 rounded-[var(--radius-md)] border border-input bg-card px-3 text-sm font-medium text-foreground shadow-[var(--shadow-xs)] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 sm:max-w-48"
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
