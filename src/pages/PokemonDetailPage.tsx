import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  getPokemon,
  getPokemonSpecies,
  getType,
  getSpanishName,
  PokeApiError,
} from '@/lib/pokeapi'
import { parseSpeciesIdParam } from '@/lib/routing/speciesId'
import { Button } from '@/components/ui/button'
import { Search } from '@/components/icons'
import { BentoCard, MiniCard } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { CompareLink } from '@/features/compare/CompareLink'
import { translatePokemonStat } from '@/features/localization'
import { useGameContext } from '@/features/games'
import {
  resolvePokemonDefenseForGame,
  selectPokemonStatsForGeneration,
  selectPokemonTypesForGeneration,
  type DefensiveMatchup,
} from '@/features/historical'
import { readManualReturn } from '@/features/manuals/manualReturn'
import { TypeChip } from '@/features/types'
import { recordRecentActivity } from '@/features/activity'
import { isOnboardingInProgress } from '@/features/onboarding'

const NAMES_ACCORDION_LIMIT = 10

interface PokemonDetailData {
  nameEs: string
  spriteUrl: string | null
  artworkUrl: string | null
  height: number | null
  weight: number | null
  types: string[]
  stats: Array<{ name: string; value: number }>
  totalBaseStats: number
  otherNames: Array<{ lang: string; name: string }>
  gameTitle: string
  generation: 4 | 5
  defense: DefensiveMatchup[] | null
}

type DetailRequestResult =
  | { key: string; status: 'success'; data: PokemonDetailData }
  | { key: string; status: 'error'; message: string }

function formatSpeciesId(id: number): string {
  return `#${String(id).padStart(3, '0')}`
}

function generationLabel(generation: 4 | 5): string {
  return generation === 4 ? 'Generación IV' : 'Generación V'
}

function multiplierLabel(multiplier: DefensiveMatchup['multiplier']): string {
  if (multiplier === 0.25) return '×¼'
  if (multiplier === 0.5) return '×½'
  return `×${multiplier}`
}

function MatchupGroup({
  title,
  matchups,
}: {
  title: string
  matchups: DefensiveMatchup[]
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {matchups.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ninguna</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {matchups.map((matchup) => (
            <li key={matchup.attackingType}>
              <TypeChip type={matchup.attackingType} suffix={multiplierLabel(matchup.multiplier)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function PokemonDetailPage() {
  const location = useLocation()
  const manualReturn = readManualReturn(location.state)
  const { game, isAll } = useGameContext()
  const { speciesId: speciesIdParam } = useParams<{ speciesId: string }>()
  const [retry, setRetry] = useState(0)
  const [requestResult, setRequestResult] =
    useState<DetailRequestResult | null>(null)

  const speciesId = parseSpeciesIdParam(speciesIdParam)
  const invalidId = speciesId == null
  const requestKey = speciesId == null ? null : `${speciesId}:${game.slug}:${retry}`

  useEffect(() => {
    if (!requestKey || speciesId == null) return

    const controller = new AbortController()
    const load = async () => {
      try {
        const species = await getPokemonSpecies(speciesId, {
          signal: controller.signal,
        })
        const variety = species.varieties.find((candidate) => candidate.is_default)
          ?? species.varieties[0]
        const pokemon = await getPokemon(variety?.pokemon.name ?? species.name, {
          signal: controller.signal,
        })
        if (controller.signal.aborted) return
        const nameEs = getSpanishName(species) ?? species.name
        const spriteUrl = pokemon.sprites?.front_default ?? null
        const artworkUrl = pokemon.sprites?.official_artwork ?? null
        const types = selectPokemonTypesForGeneration(pokemon, game.generation)
          .map((entry) => entry.type.name)
        const stats = selectPokemonStatsForGeneration(pokemon, game.generation)
          .map((s) => ({
            name: s.stat.name,
            value: s.base_stat ?? 0,
          }))
        const totalBaseStats = stats.reduce((sum, s) => sum + s.value, 0)
        const otherNames = species.names
          .filter((n) => n.language.name !== 'es')
          .slice(0, NAMES_ACCORDION_LIMIT)
          .map((n) => ({ lang: n.language.name, name: n.name }))
        let defense: DefensiveMatchup[] | null = null
        try {
          const typeResources = await Promise.all(types.map((typeName) =>
            getType(typeName, { signal: controller.signal })
          ))
          if (controller.signal.aborted) return
          defense = resolvePokemonDefenseForGame(
            pokemon,
            new Map(typeResources.map((type) => [type.name, type])),
            { id: game.slug, generation: game.generation }
          ).matchups
        } catch {
          if (controller.signal.aborted) return
        }
        setRequestResult({
          key: requestKey,
          status: 'success',
          data: {
            nameEs,
            spriteUrl,
            artworkUrl,
            height: pokemon.height ?? null,
            weight: pokemon.weight ?? null,
            types,
            stats,
            totalBaseStats,
            otherNames,
            gameTitle: isAll ? 'Todos los juegos' : game.title,
            generation: game.generation,
            defense,
          },
        })
      } catch (error) {
        if (controller.signal.aborted ||
            (error instanceof PokeApiError && error.kind === 'abort')) return
        setRequestResult({
          key: requestKey,
          status: 'error',
          message: error instanceof PokeApiError && error.status === 404
            ? 'No existe ninguna especie con este identificador.'
            : 'Error al cargar los datos. Comprueba tu conexión e inténtalo de nuevo.',
        })
      }
    }

    void load()

    return () => {
      controller.abort()
    }
  }, [game.generation, game.slug, game.title, isAll, requestKey, speciesId])

  useEffect(() => {
    if (speciesId == null || requestKey == null || requestResult?.key !== requestKey || requestResult.status !== 'success' || isOnboardingInProgress()) return
    const detail = requestResult.data
    recordRecentActivity({
      kind: 'pokemon',
      id: String(speciesId),
      speciesId,
      route: `/pokemon/${speciesId}`,
      title: detail.nameEs,
      subtitle: `${formatSpeciesId(speciesId)} · ${detail.gameTitle}`,
      spriteUrl: detail.spriteUrl,
      types: detail.types,
    })
  }, [requestKey, requestResult, speciesId])

  if (invalidId) {
    return (
      <>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Pokémon no disponible
        </h1>
        <p className="mb-4 text-muted-foreground">
          Identificador no válido.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link to="/pokedex">Ir a Pokédex</Link>
        </Button>
      </>
    )
  }

  if (requestKey && requestResult?.key === requestKey && requestResult.status === 'error') {
    return (
      <>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Pokémon no disponible
        </h1>
        <p className="mb-4 text-muted-foreground">{requestResult.message}</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/pokedex">Ir a Pokédex</Link>
        </Button>
      </>
    )
  }

  if (
    !requestKey ||
    requestResult?.key !== requestKey ||
    requestResult.status !== 'success'
  ) {
    return (
      <>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Cargando…
        </h1>
        <p className="text-muted-foreground">Cargando ficha del Pokémon.</p>
      </>
    )
  }

  const detail = requestResult.data
  const weaknesses = detail.defense?.filter((entry) => entry.multiplier > 1) ?? []
  const resistances = detail.defense?.filter((entry) => entry.multiplier > 0 && entry.multiplier < 1) ?? []
  const immunities = detail.defense?.filter((entry) => entry.multiplier === 0) ?? []

  return (
    <div className="page-stack">
      <BentoCard className="relative overflow-hidden p-0" aria-labelledby="pokemon-name" data-tour="pokemon-identity">
        <span className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full bg-ui-lavender/35" aria-hidden />
        <div className="relative grid items-center gap-4 p-5 sm:grid-cols-[minmax(12rem,0.8fr)_1.2fr] sm:p-7">
          <div className="mx-auto flex size-48 items-center justify-center rounded-[var(--radius-xl)] bg-secondary shadow-[var(--shadow-xs)] sm:size-56">
            {(detail.artworkUrl || detail.spriteUrl) ? (
              <img
                src={detail.artworkUrl ?? detail.spriteUrl ?? ''}
                alt={`Ilustración de ${detail.nameEs}`}
                className={detail.artworkUrl ? 'size-44 object-contain sm:size-52' : 'size-36 object-contain [image-rendering:pixelated] sm:size-44'}
              />
            ) : (
              <span className="text-sm text-muted-foreground">Imagen no disponible</span>
            )}
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold tracking-wide text-muted-foreground">{formatSpeciesId(speciesId)}</p>
            <h1 id="pokemon-name" className="page-title mt-1">{detail.nameEs}</h1>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              {detail.types.map((type) => <TypeChip key={type} type={type} variant="solid" />)}
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">{detail.gameTitle} · {generationLabel(detail.generation)}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Tipos, stats y defensa respetan sus reglas históricas.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              <FavoriteButton speciesId={speciesId} speciesName={detail.nameEs} showLabel />
              <CompareLink speciesId={speciesId} speciesName={detail.nameEs} showLabel />
            </div>
          </div>
        </div>
      </BentoCard>

      <section aria-labelledby="quick-data-title">
        <h2 id="quick-data-title" className="sr-only">Datos rápidos</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniCard className="bg-ui-blue/55">
            <p className="text-xs font-semibold text-ui-blue-strong">Altura</p>
            <p className="mt-1 text-xl font-bold tabular-nums">{detail.height == null ? '—' : `${detail.height / 10} m`}</p>
          </MiniCard>
          <MiniCard className="bg-ui-yellow/55">
            <p className="text-xs font-semibold text-ui-yellow-strong">Peso</p>
            <p className="mt-1 text-xl font-bold tabular-nums">{detail.weight == null ? '—' : `${detail.weight / 10} kg`}</p>
          </MiniCard>
          <MiniCard className="bg-ui-green/55">
            <p className="text-xs font-semibold text-ui-green-strong">Total base</p>
            <p className="mt-1 text-xl font-bold tabular-nums">{detail.totalBaseStats}</p>
          </MiniCard>
          <MiniCard className="bg-ui-lavender/55">
            <p className="text-xs font-semibold text-ui-lavender-strong">Contexto</p>
            <p className="mt-1 text-xl font-bold">Gen {detail.generation === 4 ? 'IV' : 'V'}</p>
          </MiniCard>
        </div>
      </section>

      <BentoCard aria-labelledby="stats-title">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-green-strong">Rendimiento</p>
            <h2 id="stats-title" className="mt-1 text-xl font-bold">Estadísticas base</h2>
          </div>
          <p className="rounded-full bg-ui-green/55 px-3 py-1 text-sm font-bold tabular-nums">Total {detail.totalBaseStats}</p>
        </div>
        <ul className="grid gap-3">
          {detail.stats.map((stat) => (
            <li key={stat.name} className="grid grid-cols-[minmax(5.75rem,0.75fr)_2fr_2.5rem] items-center gap-3 text-sm">
              <span className="font-medium text-muted-foreground">{translatePokemonStat(stat.name, true)}</span>
              <span className="h-3 overflow-hidden rounded-full bg-secondary" aria-hidden>
                <span className="block h-full rounded-full bg-ui-green-strong" style={{ width: `${Math.min(100, (stat.value / 180) * 100)}%` }} />
              </span>
              <span className="text-right font-bold tabular-nums">{stat.value}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">El total es la suma de las estadísticas base; las barras comparten una misma escala visual.</p>
      </BentoCard>

      <BentoCard aria-labelledby="defense-title">
        <Accordion type="single" collapsible defaultValue="defense">
          <AccordionItem value="defense" className="border-0">
            <AccordionTrigger className="p-0 hover:bg-transparent">
              <span className="text-left">
                <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-ui-lavender-strong">Matchup</span>
                <span id="defense-title" className="mt-1 block text-xl font-bold text-foreground">Defensa por tipos</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-5">
              {detail.defense == null ? (
                <div className="rounded-[var(--radius-md)] border border-dashed border-border bg-secondary/45 p-4" role="status">
                  <p className="text-sm text-muted-foreground">No se pudieron cargar las relaciones de tipos. La ficha básica sigue disponible.</p>
                  <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setRetry((value) => value + 1)}>Reintentar defensa</Button>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-3">
                  <MatchupGroup title="Debilidades" matchups={weaknesses} />
                  <MatchupGroup title="Resistencias" matchups={resistances} />
                  <MatchupGroup title="Inmunidades" matchups={immunities} />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </BentoCard>

      {detail.otherNames.length > 0 && (
        <BentoCard>
          <Accordion type="single" collapsible>
            <AccordionItem value="names" className="border-0">
              <AccordionTrigger className="p-0 hover:bg-transparent">Nombres en otros idiomas</AccordionTrigger>
              <AccordionContent className="pt-4">
                <ul className="grid gap-2 text-sm sm:grid-cols-2">
                  {detail.otherNames.map((name) => (
                    <li key={name.lang} className="rounded-[var(--radius-sm)] bg-secondary/60 px-3 py-2">
                      <span className="text-muted-foreground">{name.lang}:</span> {name.name}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </BentoCard>
      )}

      <nav className="flex flex-wrap gap-3 pb-2" aria-label="Volver desde la ficha">
        {manualReturn && <Button asChild variant="outline"><Link to={manualReturn.path}>{manualReturn.label}</Link></Button>}
        <Button asChild variant="outline"><Link to="/search"><Search className="size-4" aria-hidden />Buscar otro Pokémon</Link></Button>
      </nav>
    </div>
  )
}
