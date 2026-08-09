import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Dna, MapPin, RefreshCw, Search, Shield, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getMainGameContext, type MainGameContext, type MainGameSlug } from '@/features/games/gameCatalog'
import { bundledTypesByName } from '@/features/historical/typeRelationsData'
import { resolvePokemonDefenseForGame } from '@/features/historical'
import { humanizePokeApiName, translateMoveLearnMethod, translatePokemonType, translateVersionGroup } from '@/features/localization'
import { pokemonSummarySnapshot, type PokemonSummaryItem } from '@/features/pokedex/summary'
import { getPokemon, getPokemonSpecies } from '@/lib/pokeapi'
import type { EncounterArea, EvolutionChain, EvolutionDetail } from './gameDataModels'
import { createManualReturnState } from '../manualReturn'
import {
  getEvolutionChain,
  getMoveName,
  getPokemonEncounters,
  getPokemonGameMoves,
  getRegionalPokedex,
  selectEncountersForGame,
  selectEvolutionForGame,
  selectMovesForGame,
  spanishMoveName,
  speciesId,
} from './gameDataServices'

type LoadState<T> =
  | { status: 'idle' | 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error' }

function ResourcePanel<T>({
  title,
  description,
  icon: Icon,
  load,
  children,
}: {
  title: string
  description: string
  icon: typeof Dna
  load: (signal: AbortSignal) => Promise<T>
  children: (data: T) => ReactNode
}) {
  const [state, setState] = useState<LoadState<T>>({ status: 'idle' })
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])

  const start = async () => {
    controller.current?.abort()
    const nextController = new AbortController()
    controller.current = nextController
    setState({ status: 'loading' })
    try {
      const data = await load(nextController.signal)
      if (!nextController.signal.aborted) setState({ status: 'success', data })
    } catch {
      if (!nextController.signal.aborted) setState({ status: 'error' })
    }
  }

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="grid-cols-[auto_1fr] items-start gap-x-3 px-5">
        <span className="row-span-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><Icon className="size-5" aria-hidden /></span>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm leading-5 text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="px-5">
        {state.status !== 'success' && (
          <Button type="button" variant={state.status === 'error' ? 'outline' : 'secondary'} disabled={state.status === 'loading'} onClick={() => void start()}>
            {state.status === 'loading' ? <><RefreshCw className="animate-spin" aria-hidden />Cargando…</> : state.status === 'error' ? <><RefreshCw aria-hidden />Reintentar</> : 'Consultar'}
          </Button>
        )}
        {state.status === 'error' && <p className="mt-3 text-sm text-muted-foreground" role="alert">PokeAPI no está disponible. La guía editorial sigue funcionando.</p>}
        {state.status === 'success' && children(state.data)}
      </CardContent>
    </Card>
  )
}

function formatArea(value: string): string {
  const known: Record<string, string> = {
    'lake-verity-before-galactic-intervention': 'Lago Veraz (inicio de la aventura)',
    'sinnoh-route-201-area': 'Ruta 201 (Sinnoh)',
    'new-bark-town-area': 'Pueblo Primavera',
    'nuvema-town-area': 'Pueblo Arcilla',
    'aspertia-city-area': 'Ciudad Engobe',
  }
  if (known[value]) return known[value]
  return humanizePokeApiName(value.replace(/^sinnoh-/, '').replace(/-area$/, ''))
    .replace(/^Route (\d+)/i, 'Ruta $1')
}

function evolutionCondition(detail: EvolutionDetail | undefined): string {
  if (!detail) return 'Forma inicial'
  const parts: string[] = []
  if (detail.minLevel != null) parts.push(`nivel ${detail.minLevel}`)
  if (detail.minHappiness != null) parts.push(`amistad ${detail.minHappiness}`)
  if (detail.minBeauty != null) parts.push(`belleza ${detail.minBeauty}`)
  if (detail.item) parts.push(`usar ${humanizePokeApiName(detail.item.name)}`)
  if (detail.heldItem) parts.push(`llevar ${humanizePokeApiName(detail.heldItem.name)}`)
  if (detail.knownMove) parts.push(`conocer ${humanizePokeApiName(detail.knownMove.name)}`)
  if (detail.location) parts.push(`en ${humanizePokeApiName(detail.location.name)}`)
  if (detail.timeOfDay) parts.push(detail.timeOfDay === 'day' ? 'de día' : detail.timeOfDay === 'night' ? 'de noche' : detail.timeOfDay)
  return parts.length > 0 ? parts.join(' · ') : humanizePokeApiName(detail.trigger.name)
}

function flattenEvolution(node: EvolutionChain['chain'], depth = 0): Array<{ id: number; name: string; depth: number; condition: string }> {
  return [
    { id: speciesId(node.species), name: node.species.name, depth, condition: evolutionCondition(node.details[0]) },
    ...node.evolvesTo.flatMap((child) => flattenEvolution(child, depth + 1)),
  ]
}

interface LearnsetView {
  levelMoves: Array<{ name: string; level: number }>
  methodCounts: Array<{ method: string; count: number }>
}

function SpeciesResources({ pokemon, game }: { pokemon: PokemonSummaryItem; game: MainGameContext }) {
  const location = useLocation()
  const moves = async (signal: AbortSignal): Promise<LearnsetView> => {
    const selected = selectMovesForGame(await getPokemonGameMoves(pokemon.id, { signal }), game)
    const levelMoves = selected
      .flatMap((move) => move.details
        .filter((detail) => detail.method.name === 'level-up')
        .map((detail) => ({ resource: move.move, level: detail.level })))
      .sort((left, right) => left.level - right.level)
    const localized = await Promise.all(levelMoves.map(async (entry) => ({
      name: spanishMoveName(await getMoveName(entry.resource, { signal })),
      level: entry.level,
    })))
    const counts = new Map<string, Set<string>>()
    for (const move of selected) for (const detail of move.details) {
      const names = counts.get(detail.method.name) ?? new Set<string>()
      names.add(move.move.name)
      counts.set(detail.method.name, names)
    }
    return { levelMoves: localized, methodCounts: [...counts].map(([method, names]) => ({ method, count: names.size })) }
  }

  const evolution = async (signal: AbortSignal) => {
    const species = await getPokemonSpecies(pokemon.id, { signal })
    if (!species.evolution_chain) return null
    return selectEvolutionForGame(await getEvolutionChain(species.evolution_chain.url, { signal }), game)
  }

  const encounters = async (signal: AbortSignal): Promise<EncounterArea[]> => (
    selectEncountersForGame(await getPokemonEncounters(pokemon.id, { signal }), game)
  )

  const defense = async (signal: AbortSignal) => {
    const loaded = await getPokemon(pokemon.name, { signal })
    return resolvePokemonDefenseForGame(loaded, bundledTypesByName, { id: game.slug, generation: game.generation })
  }

  return (
    <div className="mt-6 grid gap-3 lg:grid-cols-2">
      <ResourcePanel title={`Evolución en ${game.shortTitle}`} description={`Reglas vigentes en ${translateVersionGroup(game.versionGroup)}, incluidas las heredadas.`} icon={Dna} load={evolution}>
        {(chain) => chain ? (
          <ol className="space-y-2">{flattenEvolution(chain.chain).map((entry, index) => <li key={`${entry.id}-${index}`} className="rounded-lg bg-secondary/60 p-3" style={{ marginLeft: `${Math.min(entry.depth, 2) * 0.75}rem` }}><Link className="font-medium text-primary hover:underline" to={`/pokemon/${entry.id}`} state={createManualReturnState(location.pathname, `Volver a ${game.title}`)}>{pokemonSummarySnapshot.items.find((item) => item.id === entry.id)?.nameEs ?? humanizePokeApiName(entry.name)}</Link><p className="mt-1 text-xs text-muted-foreground">{entry.condition}</p></li>)}</ol>
        ) : <p className="text-sm text-muted-foreground">No hay una cadena evolutiva registrada.</p>}
      </ResourcePanel>

      <ResourcePanel title="Dónde aparece" description={`Encuentros filtrados exclusivamente por la versión ${game.version}.`} icon={MapPin} load={encounters}>
        {(areas) => areas.length > 0 ? <ul className="space-y-2">{areas.slice(0, 16).map((area) => <li key={area.locationArea.name} className="rounded-lg bg-secondary/60 p-3"><p className="font-medium">{formatArea(area.locationArea.name)}</p><p className="mt-1 text-xs text-muted-foreground">Nivel {Math.min(...area.versions.flatMap((version) => version.details.map((detail) => detail.minLevel)))}–{Math.max(...area.versions.flatMap((version) => version.details.map((detail) => detail.maxLevel)))} · {game.shortTitle}</p></li>)}</ul> : <p className="text-sm text-muted-foreground">No hay encuentros salvajes registrados para esta especie en {game.shortTitle}.</p>}
      </ResourcePanel>

      <ResourcePanel title="Qué aprende" description={`Movimientos y métodos del grupo ${translateVersionGroup(game.versionGroup)}.`} icon={BookOpen} load={moves}>
        {(learnset) => <div className="space-y-4"><div className="flex flex-wrap gap-2">{learnset.methodCounts.map((entry) => <Badge key={entry.method} variant="secondary">{translateMoveLearnMethod(entry.method)} · {entry.count}</Badge>)}</div>{learnset.levelMoves.length > 0 ? <ol className="space-y-2">{learnset.levelMoves.map((move, index) => <li key={`${move.name}-${move.level}-${index}`} className="flex justify-between gap-3 border-b border-border py-2 text-sm last:border-0"><span>{move.name}</span><span className="shrink-0 text-muted-foreground">Nv. {move.level}</span></li>)}</ol> : <p className="text-sm text-muted-foreground">No hay movimientos por nivel registrados para este grupo.</p>}</div>}
      </ResourcePanel>

      <ResourcePanel title={`Defensa en Generación ${game.generation === 4 ? 'IV' : 'V'}`} description="Tipos y multiplicadores históricos, sin aplicar reglas modernas." icon={Shield} load={defense}>
        {(result) => <div className="space-y-3"><div className="flex flex-wrap gap-2">{result.defendingTypes.map((type) => <Badge key={type}>{translatePokemonType(type)}</Badge>)}</div><div className="flex flex-wrap gap-2">{result.matchups.filter((matchup) => matchup.multiplier !== 1).map((matchup) => <Badge key={matchup.attackingType} variant="secondary">{translatePokemonType(matchup.attackingType)} ×{matchup.multiplier}</Badge>)}</div></div>}
      </ResourcePanel>
    </div>
  )
}

export function GameDataExplorer({ gameSlug, region }: { gameSlug: MainGameSlug; region: string }) {
  const location = useLocation()
  const game = getMainGameContext(gameSlug)
  const [state, setState] = useState<LoadState<PokemonSummaryItem[]>>({ status: 'idle' })
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [visible, setVisible] = useState(18)
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])

  const load = async () => {
    controller.current?.abort()
    const nextController = new AbortController()
    controller.current = nextController
    setState({ status: 'loading' })
    try {
      const regional = await getRegionalPokedex(game, { signal: nextController.signal })
      const summaryById = new Map(pokemonSummarySnapshot.items.map((item) => [item.id, item]))
      const items = regional.entries.map((entry) => summaryById.get(speciesId(entry.species))).filter((item): item is PokemonSummaryItem => item != null)
      if (!nextController.signal.aborted) {
        setState({ status: 'success', data: items })
        setSelectedId(items[0]?.id ?? null)
      }
    } catch {
      if (!nextController.signal.aborted) setState({ status: 'error' })
    }
  }

  const allItems = state.status === 'success' ? state.data : []
  const normalizedQuery = query.trim().toLocaleLowerCase('es')
  const filtered = normalizedQuery
    ? allItems.filter((item) => item.nameEs.toLocaleLowerCase('es').includes(normalizedQuery) || String(item.id) === normalizedQuery)
    : allItems
  const selected = allItems.find((item) => item.id === selectedId) ?? null

  return (
    <section className="scroll-mt-20" id={`explorador-${game.slug}`}>
      <div className="rounded-2xl border border-border bg-gradient-to-br from-secondary/80 to-card p-5 sm:p-7">
        <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-5" aria-hidden /></span><div><p className="text-sm font-medium text-primary">Datos de PokeAPI bajo demanda</p><h2 className="text-2xl font-semibold">Explorador de {game.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Consulta la Pokédex regional y, para cada especie, su evolución, encuentros, movimientos y defensa en el contexto exacto de {game.shortTitle}.</p></div></div>
        {state.status !== 'success' && <div className="mt-5"><Button type="button" onClick={() => void load()} disabled={state.status === 'loading'}>{state.status === 'loading' ? <><RefreshCw className="animate-spin" aria-hidden />Cargando Pokédex…</> : state.status === 'error' ? <><RefreshCw aria-hidden />Reintentar Pokédex</> : `Cargar Pokédex de ${region}`}</Button>{state.status === 'error' && <p className="mt-3 text-sm text-muted-foreground" role="alert">No se pudo contactar con PokeAPI. Puedes seguir leyendo toda la guía y reintentarlo después.</p>}</div>}
      </div>

      {state.status === 'success' && (
        <div className="mt-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="relative block"><span className="sr-only">Buscar en la Pokédex de {region}</span><Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" aria-hidden /><input value={query} onChange={(event) => { setQuery(event.target.value); setVisible(18) }} className="min-h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Buscar por nombre o número" /></label>
            <Badge variant="secondary" className="w-fit self-center">{filtered.length} de {allItems.length}</Badge>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.slice(0, visible).map((item) => <button type="button" key={item.id} onClick={() => setSelectedId(item.id)} aria-pressed={selectedId === item.id} className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card p-2 text-left outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary aria-pressed:bg-primary/10"><span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary">{item.sprite ? <img src={item.sprite} alt="" loading="lazy" className="size-12 object-contain [image-rendering:pixelated]" /> : <span className="text-xs">#{item.id}</span>}</span><span className="min-w-0"><span className="block truncate text-sm font-medium">{item.nameEs}</span><span className="text-xs text-muted-foreground">{region} #{allItems.indexOf(item) + 1}</span></span></button>)}
          </div>
          {visible < filtered.length && <Button className="mt-4 w-full" type="button" variant="outline" onClick={() => setVisible((value) => value + 18)}>Ver 18 más</Button>}
          {filtered.length === 0 && <p className="mt-5 rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">No hay coincidencias en la Pokédex de {region}.</p>}

          {selected && <div className="mt-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-muted-foreground">Especie seleccionada</p><h3 className="text-xl font-semibold">{selected.nameEs}</h3></div><Button asChild size="sm" variant="outline"><Link to={`/pokemon/${selected.id}`} state={createManualReturnState(location.pathname, `Volver a ${game.title}`)}>Abrir ficha</Link></Button></div><SpeciesResources key={`${game.slug}-${selected.id}`} pokemon={selected} game={game} /></div>}
        </div>
      )}
    </section>
  )
}
