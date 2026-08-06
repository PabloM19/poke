import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getPokemon,
  getPokemonSpecies,
  getType,
  getSpanishName,
  PokeApiError,
} from '@/lib/pokeapi'
import { parseSpeciesIdParam } from '@/lib/routing/speciesId'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { CompareLink } from '@/features/compare/CompareLink'
import { translatePokemonStat, translatePokemonType } from '@/features/localization'
import { useGameContext } from '@/features/games'
import {
  resolvePokemonDefenseForGame,
  selectPokemonStatsForGeneration,
  selectPokemonTypesForGeneration,
  type DefensiveMatchup,
} from '@/features/historical'

const NAMES_ACCORDION_LIMIT = 10

interface PokemonDetailData {
  nameEs: string
  spriteUrl: string | null
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
              <Badge variant="outline">
                {translatePokemonType(matchup.attackingType)} {multiplierLabel(matchup.multiplier)}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function PokemonDetailPage() {
  const { game } = useGameContext()
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
            types,
            stats,
            totalBaseStats,
            otherNames,
            gameTitle: game.title,
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
  }, [game.generation, game.slug, game.title, requestKey, speciesId])

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
    <>
      <div className="mb-6 flex flex-col items-center gap-4">
        {detail.spriteUrl && (
          <img
            src={detail.spriteUrl}
            alt=""
            className="h-32 w-32 object-contain"
          />
        )}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {formatSpeciesId(speciesId)}
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            {detail.nameEs}
          </h1>
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {detail.types.map((t) => (
              <Badge key={t} variant="secondary">
                {translatePokemonType(t)}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-muted/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contexto de juego</p>
        <p className="mt-1 font-medium">{detail.gameTitle} · {generationLabel(detail.generation)}</p>
        <p className="mt-1 text-sm text-muted-foreground">Tipos, stats y defensa se muestran como funcionan en este juego.</p>
      </div>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-medium text-foreground">
          Estadísticas base
        </h2>
        <ul className="space-y-1 text-sm">
          {detail.stats.map((s) => (
            <li key={s.name} className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                {translatePokemonStat(s.name, true)}
              </span>
              <span className="font-medium">{s.value}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted-foreground">
          Total: {detail.totalBaseStats}. Total = suma de las estadísticas base.
        </p>
      </section>

      <section className="mb-6" aria-labelledby="defense-title">
        <h2 id="defense-title" className="mb-2 text-lg font-medium text-foreground">Defensa por tipos</h2>
        {detail.defense == null ? (
          <div className="rounded-xl border border-dashed border-border p-4" role="status">
            <p className="text-sm text-muted-foreground">No se pudieron cargar las relaciones de tipos. La ficha básica sigue disponible.</p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setRetry((value) => value + 1)}>Reintentar defensa</Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <MatchupGroup title="Debilidades" matchups={weaknesses} />
            <MatchupGroup title="Resistencias" matchups={resistances} />
            <MatchupGroup title="Inmunidades" matchups={immunities} />
          </div>
        )}
      </section>

      {detail.otherNames.length > 0 && (
        <section className="mb-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="names">
              <AccordionTrigger>
                Nombres en otros idiomas
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1 text-sm">
                  {detail.otherNames.map((n) => (
                    <li key={n.lang}>
                      <span className="text-muted-foreground">{n.lang}:</span>{' '}
                      {n.name}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <FavoriteButton
          speciesId={speciesId}
          speciesName={detail.nameEs}
          showLabel
        />
        <CompareLink speciesId={speciesId} speciesName={detail.nameEs} showLabel />
      </div>

      <Link
        to="/search"
        className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
      >
        Volver a Buscar
      </Link>
    </>
  )
}
