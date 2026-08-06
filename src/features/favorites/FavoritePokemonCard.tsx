import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { getPokemon, getPokemonSpecies, getSpanishName, PokeApiError } from '@/lib/pokeapi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FavoriteButton } from './FavoriteButton'

interface FavoriteCardData {
  name: string
  spriteUrl: string | null
  types: string[]
}

type LoadResult =
  | { key: string; status: 'success'; data: FavoriteCardData }
  | { key: string; status: 'error' }

function formatId(id: number): string {
  return `#${String(id).padStart(3, '0')}`
}

export function FavoritePokemonCard({ speciesId }: { speciesId: number }) {
  const [retry, setRetry] = useState(0)
  const requestKey = `${speciesId}:${retry}`
  const [result, setResult] = useState<LoadResult | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const species = await getPokemonSpecies(speciesId, { signal: controller.signal })
        const variety = species.varieties.find((entry) => entry.is_default) ?? species.varieties[0]
        const pokemon = await getPokemon(variety?.pokemon.name ?? species.name, {
          signal: controller.signal,
        })
        if (controller.signal.aborted) return
        setResult({
          key: requestKey,
          status: 'success',
          data: {
            name: getSpanishName(species) ?? species.name,
            spriteUrl: pokemon.sprites.front_default,
            types: pokemon.types.map((entry) => entry.type.name),
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
  }, [requestKey, speciesId])

  const current = result?.key === requestKey ? result : null
  const data = current?.status === 'success' ? current.data : null
  const name = data?.name ?? formatId(speciesId)

  return (
    <Card className="relative h-full py-4">
      <CardContent className="flex h-full flex-col items-center px-4 text-center">
        <FavoriteButton
          speciesId={speciesId}
          speciesName={name}
          className="absolute right-2 top-2"
        />
        {current?.status === 'error' ? (
          <div className="flex min-h-44 flex-col items-center justify-center px-3" role="alert">
            <p className="font-medium">{formatId(speciesId)}</p>
            <p className="mt-2 text-sm text-muted-foreground">No se pudieron cargar los datos.</p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setRetry((value) => value + 1)}>
              <RefreshCw className="size-4" aria-hidden /> Reintentar
            </Button>
          </div>
        ) : (
          <Link to={`/pokemon/${speciesId}`} className="flex w-full flex-1 flex-col items-center rounded-lg pt-4 outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Ver ficha de ${name}`}>
            <div className="flex size-24 items-center justify-center rounded-full bg-secondary">
              {data?.spriteUrl ? (
                <img src={data.spriteUrl} alt="" className="size-24 object-contain [image-rendering:pixelated]" />
              ) : (
                <span className="text-sm text-muted-foreground" role="status">Cargando…</span>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{formatId(speciesId)}</p>
            <h2 className="font-semibold">{data?.name ?? 'Cargando…'}</h2>
            {data && (
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {data.types.map((type) => <Badge key={type} variant="secondary">{type}</Badge>)}
              </div>
            )}
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
