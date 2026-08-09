import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getPokemon, getPokemonSpecies, getSpanishName, PokeApiError } from '@/lib/pokeapi'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { PokemonReference } from '../content/types'
import { CompareLink } from '@/features/compare/CompareLink'
import { translatePokemonType } from '@/features/localization'
import { createManualReturnState } from '../manualReturn'

interface Enrichment {
  spriteUrl: string | null
  types: string[]
  name: string
}

type EnrichmentResult =
  | { key: string; status: 'success'; data: Enrichment }
  | { key: string; status: 'error' }

export function PokemonReferenceCard({ reference }: { reference: PokemonReference }) {
  const location = useLocation()
  const requestKey = `${reference.speciesId}:${reference.name}`
  const [result, setResult] = useState<EnrichmentResult | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const species = await getPokemonSpecies(reference.speciesId, { signal: controller.signal })
        const variety = species.varieties.find((candidate) => candidate.is_default)
          ?? species.varieties[0]
        const pokemon = await getPokemon(variety?.pokemon.name ?? species.name, {
          signal: controller.signal,
        })
        if (controller.signal.aborted) return
        setResult({
          key: requestKey,
          status: 'success',
          data: {
            spriteUrl: pokemon.sprites.front_default,
            types: pokemon.types.map((entry) => entry.type.name),
            name: getSpanishName(species) ?? reference.name,
          },
        })
      } catch (error) {
        if (controller.signal.aborted ||
            (error instanceof PokeApiError && error.kind === 'abort')) return
        setResult({ key: requestKey, status: 'error' })
      }
    }
    void load()
    return () => controller.abort()
  }, [reference.name, reference.speciesId, requestKey])

  const current = result?.key === requestKey ? result : null
  const data = current?.status === 'success' ? current.data : null

  const displayName = data?.name ?? reference.name

  return (
      <Card className="relative h-full transition-colors hover:bg-accent/50">
        <CardContent className="flex h-full flex-col items-center p-4 text-center">
          <CompareLink
            speciesId={reference.speciesId}
            speciesName={displayName}
            className="absolute left-2 top-2"
          />
          <Link
            to={`/pokemon/${reference.speciesId}`}
            state={createManualReturnState(location.pathname)}
            className="flex h-full w-full flex-col items-center rounded-lg pt-3 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Ver ficha de ${displayName}`}
          >
          <div className="mb-2 flex size-24 items-center justify-center rounded-full bg-secondary">
            {data?.spriteUrl ? (
              <img src={data.spriteUrl} alt="" className="size-24 object-contain [image-rendering:pixelated]" />
            ) : (
              <span className="text-sm font-medium text-muted-foreground">#{reference.speciesId}</span>
            )}
          </div>
          <h3 className="font-semibold">{data?.name ?? reference.name}</h3>
          {data && <div className="mt-2 flex flex-wrap justify-center gap-1">{data.types.map((type) => <Badge key={type} variant="secondary">{translatePokemonType(type)}</Badge>)}</div>}
          {reference.description && <p className="mt-2 text-sm leading-5 text-muted-foreground">{reference.description}</p>}
          {current?.status === 'error' && <p className="mt-2 text-xs text-muted-foreground">Datos dinámicos no disponibles</p>}
          </Link>
        </CardContent>
      </Card>
  )
}

export function PokemonReferenceGrid({
  title,
  references,
}: {
  title?: string
  references: readonly PokemonReference[]
}) {
  return (
    <section className="my-6">
      {title && <h2 className="mb-3 text-xl font-semibold">{title}</h2>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {references.map((reference) => (
          <PokemonReferenceCard key={reference.speciesId} reference={reference} />
        ))}
      </div>
    </section>
  )
}
