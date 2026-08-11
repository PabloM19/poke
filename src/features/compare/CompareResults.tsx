import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { StatusState } from '@/components/ui/status-state'
import { getTypeNamesForGeneration } from '@/features/historical/pokemonDefense'
import { attackMultiplier } from '@/features/historical/typeEffectiveness'
import type { DamageMultiplier, DefensiveMatchup } from '@/features/historical/typeMatrix'
import { translatePokemonStat } from '@/features/localization'
import { useGameContext } from '@/features/games'
import { TypeChip } from '@/features/types'
import { cn } from '@/lib/utils'
import { getComparePokemonData, type ComparePokemonData } from './compareData'

type LoadState = {
  key: string
  data: readonly ComparePokemonData[]
  failedIds: readonly number[]
}

type SideTone = {
  dot: string
  surface: string
  text: string
}

const SIDE_TONES: readonly SideTone[] = [
  { dot: 'bg-ui-green-strong', surface: 'bg-ui-green/45', text: 'text-ui-green-strong' },
  { dot: 'bg-ui-lavender-strong', surface: 'bg-ui-lavender/45', text: 'text-ui-lavender-strong' },
  { dot: 'bg-ui-blue-strong', surface: 'bg-ui-blue/45', text: 'text-ui-blue-strong' },
  { dot: 'bg-ui-yellow-strong', surface: 'bg-ui-yellow/45', text: 'text-ui-yellow-strong' },
]

function formatId(id: number): string {
  return `#${String(id).padStart(3, '0')}`
}

function formatMultiplier(multiplier: DamageMultiplier): string {
  if (multiplier === 0.25) return '×¼'
  if (multiplier === 0.5) return '×½'
  return `×${multiplier}`
}

function statValue(pokemon: ComparePokemonData, name: string): number {
  return pokemon.stats.find((stat) => stat.name === name)?.value ?? 0
}

function defensiveMatchups(pokemon: ComparePokemonData, generation: 4 | 5): DefensiveMatchup[] {
  return getTypeNamesForGeneration(generation).map((attackingType) => ({
    attackingType,
    multiplier: attackMultiplier(attackingType, pokemon.types, generation),
  }))
}

function bestTypeReading(attacker: ComparePokemonData, defender: ComparePokemonData, generation: 4 | 5) {
  return attacker.types
    .map((type) => ({ type, multiplier: attackMultiplier(type, defender.types, generation) }))
    .sort((left, right) => right.multiplier - left.multiplier)[0]
}

function PokemonArtwork({ pokemon, compact = false }: { pokemon: ComparePokemonData; compact?: boolean }) {
  const src = pokemon.artworkUrl ?? pokemon.spriteUrl
  return (
    <span className={cn(
      'flex shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-card/70 shadow-[var(--shadow-xs)]',
      compact ? 'size-20' : 'size-24 sm:size-28',
    )}>
      {src ? (
        <img
          src={src}
          alt={`Ilustración de ${pokemon.name}`}
          className={cn(
            'size-[88%] object-contain',
            !pokemon.artworkUrl && '[image-rendering:pixelated]',
          )}
        />
      ) : (
        <span className="px-2 text-center text-xs text-muted-foreground">Sin imagen</span>
      )}
    </span>
  )
}

function Participant({
  pokemon,
  tone,
  onReplace,
  index,
}: {
  pokemon: ComparePokemonData
  tone: SideTone
  onReplace: (index: number) => void
  index: number
}) {
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <Link to={`/pokemon/${pokemon.speciesId}`} className="interactive-clay rounded-[var(--radius-lg)] outline-none focus-visible:ring-3 focus-visible:ring-ring/35" aria-label={`Abrir ficha de ${pokemon.name}`}>
        <PokemonArtwork pokemon={pokemon} />
      </Link>
      <p className="mt-2 text-[0.6875rem] font-semibold text-muted-foreground">{formatId(pokemon.speciesId)}</p>
      <h2 className="max-w-full text-base font-bold leading-tight sm:text-lg">{pokemon.name}</h2>
      <span className={cn('mt-1 flex items-center gap-1.5 text-[0.6875rem] font-semibold', tone.text)}>
        <span className={cn('size-2 rounded-full', tone.dot)} aria-hidden /> Lado {index === 0 ? 'A' : 'B'}
      </span>
      <div className="mt-2 flex min-h-6 flex-wrap justify-center gap-1">
        {pokemon.types.map((type) => <TypeChip key={type} type={type} size="compact" />)}
      </div>
      <Button type="button" variant="ghost" size="sm" className="mt-2 px-2.5" onClick={() => onReplace(index)}>
        <RefreshCw className="size-4" aria-hidden /> Cambiar
      </Button>
    </div>
  )
}

function comparisonLabel(left: ComparePokemonData, right: ComparePokemonData, leftValue: number, rightValue: number): string {
  if (leftValue === rightValue) return 'Empate'
  return leftValue > rightValue
    ? `${left.name} +${leftValue - rightValue}`
    : `${right.name} +${rightValue - leftValue}`
}

function TotalComparison({ left, right }: { left: ComparePokemonData; right: ComparePokemonData }) {
  return (
    <div className="col-span-2 rounded-[var(--radius-lg)] border border-border bg-card/80 p-3 text-center shadow-[var(--shadow-xs)]">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Total base</p>
      <p className="mt-1 text-xl font-black tabular-nums">
        <span className="text-ui-green-strong">{left.total}</span>
        <span className="mx-2 text-sm font-semibold text-muted-foreground">—</span>
        <span className="text-ui-lavender-strong">{right.total}</span>
      </p>
      <p className="mt-1 text-xs font-semibold">{comparisonLabel(left, right, left.total, right.total)}</p>
    </div>
  )
}

function highlightFor(pokemon: ComparePokemonData, opponent: ComparePokemonData) {
  return pokemon.stats
    .map((stat) => ({ name: stat.name, difference: stat.value - statValue(opponent, stat.name) }))
    .filter((stat) => stat.difference > 0)
    .sort((left, right) => right.difference - left.difference)[0]
}

function QuickSummary({ left, right }: { left: ComparePokemonData; right: ComparePokemonData }) {
  const leftHighlight = highlightFor(left, right)
  const rightHighlight = highlightFor(right, left)
  return (
    <section aria-labelledby="quick-comparison-title">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-blue-strong">Resumen</p>
          <h2 id="quick-comparison-title" className="mt-1 text-xl font-bold">De un vistazo</h2>
        </div>
        <p className="text-xs text-muted-foreground">Diferencias estadísticas</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TotalComparison left={left} right={right} />
        <div className="rounded-[var(--radius-lg)] border border-ui-green-strong/15 bg-ui-green/40 p-3 shadow-[var(--shadow-xs)]">
          <p className="text-xs font-semibold text-ui-green-strong">Mayor diferencia de {left.name}</p>
          <p className="mt-2 font-bold">{leftHighlight ? translatePokemonStat(leftHighlight.name, true) : 'Sin ventaja estadística'}</p>
          {leftHighlight && <p className="mt-0.5 text-sm tabular-nums">+{leftHighlight.difference}</p>}
        </div>
        <div className="rounded-[var(--radius-lg)] border border-ui-lavender-strong/15 bg-ui-lavender/40 p-3 shadow-[var(--shadow-xs)]">
          <p className="text-xs font-semibold text-ui-lavender-strong">Mayor diferencia de {right.name}</p>
          <p className="mt-2 font-bold">{rightHighlight ? translatePokemonStat(rightHighlight.name, true) : 'Sin ventaja estadística'}</p>
          {rightHighlight && <p className="mt-0.5 text-sm tabular-nums">+{rightHighlight.difference}</p>}
        </div>
      </div>
    </section>
  )
}

function StatTile({ left, right, statName }: { left: ComparePokemonData; right: ComparePokemonData; statName: string }) {
  const leftValue = statValue(left, statName)
  const rightValue = statValue(right, statName)
  return (
    <li className="rounded-[var(--radius-lg)] border border-border bg-card p-3 shadow-[var(--shadow-xs)]">
      <h3 className="text-center text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">{translatePokemonStat(statName, true)}</h3>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-2 text-lg font-black tabular-nums">
        <span className="text-right text-ui-green-strong">{leftValue}</span>
        <span className="pb-0.5 text-[0.625rem] font-semibold text-muted-foreground">VS</span>
        <span className="text-ui-lavender-strong">{rightValue}</span>
      </div>
      <div className="mt-2 grid grid-cols-[1fr_2px_1fr] items-center gap-1" aria-hidden>
        <span className="flex h-2 justify-end overflow-hidden rounded-l-full bg-secondary">
          <span className="compare-stat-fill compare-stat-fill-left block h-full rounded-l-full bg-ui-green-strong" style={{ width: `${Math.min(100, (leftValue / 180) * 100)}%` }} />
        </span>
        <span className="h-4 rounded-full bg-border" />
        <span className="h-2 overflow-hidden rounded-r-full bg-secondary">
          <span className="compare-stat-fill compare-stat-fill-right block h-full rounded-r-full bg-ui-lavender-strong" style={{ width: `${Math.min(100, (rightValue / 180) * 100)}%` }} />
        </span>
      </div>
      <p className="mt-2 truncate text-center text-xs font-semibold" title={comparisonLabel(left, right, leftValue, rightValue)}>{comparisonLabel(left, right, leftValue, rightValue)}</p>
    </li>
  )
}

function PairStats({ left, right }: { left: ComparePokemonData; right: ComparePokemonData }) {
  return (
    <section aria-labelledby="stats-comparison-title">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-green-strong">Comparación espejo</p>
        <h2 id="stats-comparison-title" className="mt-1 text-xl font-bold">Estadísticas base</h2>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {left.stats.map((stat) => <StatTile key={stat.name} left={left} right={right} statName={stat.name} />)}
      </ul>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">Las dos barras comparten escala. La etiqueta indica quién tiene el valor mayor y calcula la diferencia; no predice el resultado de un combate.</p>
    </section>
  )
}

function MatchupGroup({ title, matchups }: { title: string; matchups: readonly DefensiveMatchup[] }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">{title}</h4>
      {matchups.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {matchups.map((matchup) => <TypeChip key={matchup.attackingType} type={matchup.attackingType} size="compact" suffix={formatMultiplier(matchup.multiplier)} />)}
        </div>
      ) : <p className="mt-2 text-sm text-muted-foreground">Ninguna</p>}
    </div>
  )
}

function DefensePanel({ pokemon, index, generation }: { pokemon: ComparePokemonData; index: number; generation: 4 | 5 }) {
  const defense = useMemo(() => defensiveMatchups(pokemon, generation), [generation, pokemon])
  return (
    <article className="rounded-[var(--radius-lg)] border border-border bg-card p-3 shadow-[var(--shadow-xs)]">
      <div className="flex items-center gap-2">
        <span className={cn('size-2.5 rounded-full', SIDE_TONES[index]?.dot)} aria-hidden />
        <h3 className="min-w-0 truncate font-bold">{pokemon.name}</h3>
      </div>
      <div className="mt-4 grid gap-4">
        <MatchupGroup title="Debilidades" matchups={defense.filter((item) => item.multiplier > 1)} />
        <MatchupGroup title="Resistencias" matchups={defense.filter((item) => item.multiplier > 0 && item.multiplier < 1)} />
        <MatchupGroup title="Inmunidades" matchups={defense.filter((item) => item.multiplier === 0)} />
      </div>
    </article>
  )
}

function TypeComparison({ pokemon, generation }: { pokemon: readonly ComparePokemonData[]; generation: 4 | 5 }) {
  const pair = pokemon.length === 2 ? pokemon : null
  const leftReading = pair ? bestTypeReading(pair[0], pair[1], generation) : null
  const rightReading = pair ? bestTypeReading(pair[1], pair[0], generation) : null
  return (
    <section className="rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-[var(--shadow-sm)] sm:p-5" aria-labelledby="type-comparison-title">
      <Accordion type="single" collapsible>
        <AccordionItem value="types" className="border-0">
          <AccordionTrigger className="p-0 hover:bg-transparent">
            <span className="text-left">
              <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-ui-lavender-strong">Matchup</span>
              <span id="type-comparison-title" className="mt-1 block text-xl font-bold text-foreground">Defensa por tipos</span>
              <span className="mt-1 block text-xs font-normal text-muted-foreground">Compara debilidades, resistencias e inmunidades</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-5">
            {pair && leftReading && rightReading && (
              <div className="mb-4 rounded-[var(--radius-md)] border border-ui-blue-strong/15 bg-ui-blue/30 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-ui-blue-strong">Lectura objetiva por tipos</p>
                <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                  <p className="flex flex-wrap items-center gap-1.5"><strong>{pair[0].name}</strong><TypeChip type={leftReading.type} size="compact" suffix={formatMultiplier(leftReading.multiplier)} /><span>frente a {pair[1].name}</span></p>
                  <p className="flex flex-wrap items-center gap-1.5"><strong>{pair[1].name}</strong><TypeChip type={rightReading.type} size="compact" suffix={formatMultiplier(rightReading.multiplier)} /><span>frente a {pair[0].name}</span></p>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">Se muestra el mejor multiplicador entre sus tipos propios. No es una predicción del combate.</p>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {pokemon.map((entry, index) => <DefensePanel key={entry.speciesId} pokemon={entry} index={index} generation={generation} />)}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  )
}

function TwoPokemonComparison({ pokemon, generation, onReplace }: { pokemon: readonly ComparePokemonData[]; generation: 4 | 5; onReplace: (index: number) => void }) {
  const [left, right] = pokemon
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-[var(--shadow-md)] sm:p-6" aria-label={`${left.name} frente a ${right.name}`}>
        <span className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full bg-ui-green/35" aria-hidden />
        <span className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-ui-lavender/35" aria-hidden />
        <div className="relative grid grid-cols-[minmax(0,1fr)_3.25rem_minmax(0,1fr)] items-center gap-2 sm:gap-5">
          <Participant pokemon={left} tone={SIDE_TONES[0]} onReplace={onReplace} index={0} />
          <div className="flex size-[3.25rem] items-center justify-center rounded-full border border-ui-blue-strong/20 bg-ui-blue text-sm font-black tracking-wide text-ui-blue-strong shadow-[var(--shadow-sm)]" aria-label="frente a">VS</div>
          <Participant pokemon={right} tone={SIDE_TONES[1]} onReplace={onReplace} index={1} />
        </div>
      </section>
      <QuickSummary left={left} right={right} />
      <PairStats left={left} right={right} />
      <TypeComparison pokemon={pokemon} generation={generation} />
    </div>
  )
}

function MultiPokemonComparison({ pokemon, generation }: { pokemon: readonly ComparePokemonData[]; generation: 4 | 5 }) {
  return (
    <div className="space-y-8">
      <section aria-labelledby="multi-comparison-title">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-blue-strong">Comparación múltiple</p>
          <h2 id="multi-comparison-title" className="mt-1 text-xl font-bold">{pokemon.length} Pokémon seleccionados</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {pokemon.map((entry, index) => (
            <Link key={entry.speciesId} to={`/pokemon/${entry.speciesId}`} className={cn('interactive-clay rounded-[var(--radius-xl)] border border-border p-3 text-center shadow-[var(--shadow-sm)] outline-none focus-visible:ring-3 focus-visible:ring-ring/35', SIDE_TONES[index].surface)}>
              <PokemonArtwork pokemon={entry} compact />
              <p className="mt-2 text-[0.6875rem] text-muted-foreground">{formatId(entry.speciesId)}</p>
              <h3 className="font-bold">{entry.name}</h3>
              <div className="mt-2 flex flex-wrap justify-center gap-1">{entry.types.map((type) => <TypeChip key={type} type={type} size="compact" />)}</div>
              <p className="mt-2 text-sm font-semibold tabular-nums">Total {entry.total}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="multi-stats-title">
        <h2 id="multi-stats-title" className="mb-4 text-xl font-bold">Estadísticas base</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(pokemon[0]?.stats ?? []).map((stat) => {
            const values = pokemon.map((entry) => ({ entry, value: statValue(entry, stat.name) })).sort((left, right) => right.value - left.value)
            const best = values[0]
            const range = best.value - values[values.length - 1].value
            return (
              <article key={stat.name} className="rounded-[var(--radius-lg)] border border-border bg-card p-3 shadow-[var(--shadow-xs)]">
                <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">{translatePokemonStat(stat.name, true)}</h3>
                <ul className="mt-3 space-y-2">
                  {pokemon.map((entry, index) => (
                    <li key={entry.speciesId} className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex min-w-0 items-center gap-1.5"><span className={cn('size-2 shrink-0 rounded-full', SIDE_TONES[index].dot)} aria-hidden /><span className="truncate">{entry.name}</span></span>
                      <strong className="tabular-nums">{statValue(entry, stat.name)}</strong>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-border pt-2 text-xs font-semibold">Mayor: {best.entry.name}{range > 0 ? ` · rango ${range}` : ' · empate'}</p>
              </article>
            )
          })}
        </div>
      </section>
      <TypeComparison pokemon={pokemon} generation={generation} />
    </div>
  )
}

export function CompareResults({ ids, onReplace }: { ids: readonly number[]; onReplace: (index: number) => void }) {
  const { game } = useGameContext()
  const [retry, setRetry] = useState(0)
  const requestKey = `${ids.join(',')}:${game.slug}:${retry}`
  const [state, setState] = useState<LoadState | null>(null)

  useEffect(() => {
    if (ids.length < 2) return
    const controller = new AbortController()
    const load = async () => {
      const results = await Promise.allSettled(ids.map((id) => getComparePokemonData(id, game.generation, controller.signal)))
      if (controller.signal.aborted) return
      const data: ComparePokemonData[] = []
      const failedIds: number[] = []
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') data.push(result.value)
        else failedIds.push(ids[index])
      })
      setState({ key: requestKey, data, failedIds })
    }
    void load()
    return () => controller.abort()
  }, [game.generation, ids, requestKey])

  if (ids.length < 2) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-dashed border-border bg-card p-8 text-center shadow-[var(--shadow-xs)]" role="status">
        <p className="font-semibold">Selecciona {2 - ids.length} Pokémon más para compararlos</p>
        <p className="mt-2 text-sm text-muted-foreground">Busca por nombre o utiliza su número de Pokédex.</p>
      </div>
    )
  }

  const current = state?.key === requestKey ? state : null
  if (!current) return <StatusState title="Preparando comparación…" tone="loading" compact />

  return (
    <div className="space-y-8">
      {current.failedIds.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-destructive/40 bg-card p-4 shadow-[var(--shadow-xs)]" role="alert">
          <p className="text-sm">No se pudieron cargar: {current.failedIds.map((id) => formatId(id)).join(', ')}.</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setRetry((value) => value + 1)}>
            <RefreshCw className="size-4" aria-hidden /> Reintentar
          </Button>
        </div>
      )}
      {current.data.length === 2
        ? <TwoPokemonComparison pokemon={current.data} generation={game.generation} onReplace={onReplace} />
        : current.data.length >= 3
          ? <MultiPokemonComparison pokemon={current.data} generation={game.generation} />
          : null}
    </div>
  )
}
