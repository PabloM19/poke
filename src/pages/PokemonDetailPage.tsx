import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getPokemon,
  getPokemonSpecies,
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

const NAMES_ACCORDION_LIMIT = 10

interface PokemonDetailData {
  nameEs: string
  spriteUrl: string | null
  types: string[]
  stats: Array<{ name: string; value: number }>
  totalBaseStats: number
  otherNames: Array<{ lang: string; name: string }>
}

type DetailRequestResult =
  | { key: string; status: 'success'; data: PokemonDetailData }
  | { key: string; status: 'error'; message: string }

function formatSpeciesId(id: number): string {
  return `#${String(id).padStart(3, '0')}`
}

export function PokemonDetailPage() {
  const { speciesId: speciesIdParam } = useParams<{ speciesId: string }>()
  const [requestResult, setRequestResult] =
    useState<DetailRequestResult | null>(null)

  const speciesId = parseSpeciesIdParam(speciesIdParam)
  const invalidId = speciesId == null
  const requestKey = speciesId == null ? null : String(speciesId)

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
        const types = pokemon.types?.map((t) => t.type.name) ?? []
        const stats =
          pokemon.stats?.map((s) => ({
            name: s.stat.name,
            value: s.base_stat ?? 0,
          })) ?? []
        const totalBaseStats = stats.reduce((sum, s) => sum + s.value, 0)
        const otherNames = species.names
          .filter((n) => n.language.name !== 'es')
          .slice(0, NAMES_ACCORDION_LIMIT)
          .map((n) => ({ lang: n.language.name, name: n.name }))
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
  }, [requestKey, speciesId])

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
