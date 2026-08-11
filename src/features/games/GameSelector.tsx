import { Check, ChevronDownIcon, Gamepad2 } from '@/components/icons'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { ALL_GAMES_SLUG, MAIN_GAME_CONTEXTS, type GameSelection } from './gameCatalog'
import { useGameContext } from './useGameContext'

const generationLabels: Record<4 | 5, string> = { 4: 'Generación IV', 5: 'Generación V' }

interface GameSelectorProps {
  className?: string
}

/**
 * Shared contextual game selector. It deliberately lives in page content,
 * not the global header, while the GameContext remains the single source of
 * truth for Pokédex, Manuales and game-dependent tools.
 */
export function GameSelector({ className }: GameSelectorProps) {
  const { game, setGame, isAll } = useGameContext()
  const activeLabel = isAll ? 'Todos los juegos' : game.title
  const generations = ([4, 5] as const).map((generation) => ({
    generation,
    games: MAIN_GAME_CONTEXTS.filter((entry) => entry.generation === generation),
  }))

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            'interactive-clay inline-flex min-h-11 min-w-0 items-center justify-between gap-3 rounded-[var(--radius-md)] border border-input bg-card px-3.5 py-2 text-left shadow-[var(--shadow-xs)] outline-none hover:border-input hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/30 active:bg-accent sm:min-w-56',
            className
          )}
          aria-label={`Cambiar juego activo. Actualmente ${activeLabel}`}
          title={`Juego activo: ${activeLabel}`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Gamepad2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0 truncate font-semibold">{isAll ? 'Todos' : game.title}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            {!isAll && <span className="hidden min-[380px]:inline">Gen {game.generation === 4 ? 'IV' : 'V'}</span>}
            <ChevronDownIcon className="size-4" aria-hidden />
          </span>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[88dvh] overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle>Juego activo</SheetTitle>
          <SheetDescription>
            Elige un juego principal o “Todos” para consultar la Pokédex nacional y todos los Manuales.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 px-4 pb-6" aria-label="Juegos principales">
          <SheetClose asChild>
            <button
              type="button"
              className={cn(
                'interactive-clay flex min-h-12 w-full items-center justify-between gap-3 rounded-[var(--radius-md)] border px-3.5 py-2.5 text-left text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/35',
                isAll
                  ? 'border-ui-green-strong/45 bg-ui-green text-ui-green-strong shadow-[var(--shadow-xs)]'
                  : 'border-border bg-card hover:bg-accent'
              )}
              aria-pressed={isAll}
              aria-current={isAll ? 'true' : undefined}
              onClick={() => setGame(ALL_GAMES_SLUG)}
            >
              <span>Todos</span>
              {isAll && <Check className="size-5 shrink-0" aria-hidden />}
            </button>
          </SheetClose>
          {generations.map(({ generation, games }) => (
            <fieldset key={generation}>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {generationLabels[generation]}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {games.map((entry) => {
                  const selected = !isAll && entry.slug === game.slug
                  return (
                    <SheetClose key={entry.slug} asChild>
                      <button
                        type="button"
                        className={cn(
                          'interactive-clay flex min-h-12 w-full items-center justify-between gap-3 rounded-[var(--radius-md)] border px-3.5 py-2.5 text-left text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/35',
                          selected
                            ? 'border-ui-green-strong/45 bg-ui-green text-ui-green-strong shadow-[var(--shadow-xs)]'
                            : 'border-border bg-card hover:bg-accent'
                        )}
                        aria-pressed={selected}
                        aria-current={selected ? 'true' : undefined}
                        onClick={() => setGame(entry.slug as GameSelection)}
                      >
                        <span>{entry.title}</span>
                        {selected && <Check className="size-5 shrink-0" aria-hidden />}
                      </button>
                    </SheetClose>
                  )
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
