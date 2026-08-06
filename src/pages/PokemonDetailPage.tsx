import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSpeciesIndex } from '@/hooks/useSpeciesIndex'
import {
  getPokemon,
  getPokemonSpecies,
  getSpanishName,
} from '@/lib/pokeapi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const NAMES_ACCORDION_LIMIT = 10

function formatSpeciesId(id: number): string {
  return `#${String(id).padStart(3, '0')}`
}

function statLabel(name: string): string {
  const labels: Record<string, string> = {
    hp: 'PS',
    attack: 'Ataque',
    defense: 'Defensa',
    'special-attack': 'At. Esp.',
    'special-defense': 'Def. Esp.',
    speed: 'Velocidad',
  }
  return labels[name] ?? name
}

export function PokemonDetailPage() {
  const { speciesId: speciesIdParam } = useParams<{ speciesId: string }>()
  const { index, status: indexStatus, refresh } = useSpeciesIndex()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<{
    nameEs: string
    spriteUrl: string | null
    types: string[]
    stats: Array<{ name: string; value: number }>
    totalBaseStats: number
    otherNames: Array<{ lang: string; name: string }>
  } | null>(null)

  const speciesId = speciesIdParam != null ? parseInt(speciesIdParam, 10) : NaN
  const invalidId = !Number.isInteger(speciesId) || speciesId < 1

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (indexStatus === 'missing' || invalidId) {
      setLoading(false)
      return
    }
    const item = index.find((i) => i.speciesId === speciesId) ?? null
    if (!item) {
      setLoading(false)
      setError('Especie no encontrada en el índice.')
      return
    }

    setError(null)
    setLoading(true)
    Promise.all([
      getPokemonSpecies(speciesId),
      getPokemon(item.defaultPokemonName),
    ])
      .then(([species, pokemon]) => {
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
        setDetail({
          nameEs,
          spriteUrl,
          types,
          stats,
          totalBaseStats,
          otherNames,
        })
      })
      .catch(() => setError('Error al cargar los datos.'))
      .finally(() => setLoading(false))
  }, [speciesId, index, indexStatus, invalidId])

  if (indexStatus === 'missing' || invalidId) {
    return (
      <>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Pokémon no disponible
        </h1>
        <p className="mb-4 text-muted-foreground">
          {invalidId
            ? 'Identificador no válido.'
            : 'Aún no has descargado los datos. Construye el índice en Ajustes para ver fichas.'}
        </p>
        <Button asChild variant="outline" size="sm">
          <Link to="/pokedex">Ir a Pokédex</Link>
        </Button>
      </>
    )
  }

  if (error && !loading) {
    return (
      <>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Pokémon no disponible
        </h1>
        <p className="mb-4 text-muted-foreground">{error}</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/pokedex">Ir a Pokédex</Link>
        </Button>
      </>
    )
  }

  if (loading || !detail) {
    return (
      <>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Cargando…
        </h1>
        <p className="text-muted-foreground">Cargando ficha del Pokémon.</p>
      </>
    )
  }

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
                {t}
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
                {statLabel(s.name)}
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
        <Button variant="outline" size="sm" disabled>
          Añadir a favoritos (próximamente)
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/compare">Comparar</Link>
        </Button>
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
