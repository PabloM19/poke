import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getComparePokemonData, type ComparePokemonData } from './compareData'
import { translatePokemonStat } from '@/features/localization'
import { useGameContext } from '@/features/games'
import { TypeChip } from '@/features/types'
import { StatusState } from '@/components/ui/status-state'

type LoadState = {
  key: string
  data: readonly ComparePokemonData[]
  failedIds: readonly number[]
}

export function CompareResults({ ids }: { ids: readonly number[] }) {
  const { game } = useGameContext()
  const [retry, setRetry] = useState(0)
  const requestKey = `${ids.join(',')}:${game.slug}:${retry}`
  const [state, setState] = useState<LoadState | null>(null)

  useEffect(() => {
    if (ids.length < 2) return
    const controller = new AbortController()
    const load = async () => {
      const results = await Promise.allSettled(
        ids.map((id) => getComparePokemonData(id, game.generation, controller.signal))
      )
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
        <p className="font-medium">Elige {2 - ids.length} Pokémon más</p>
        <p className="mt-2 text-sm text-muted-foreground">La comparación empieza con dos y admite hasta cuatro.</p>
      </div>
    )
  }

  const current = state?.key === requestKey ? state : null
  if (!current) return <StatusState title="Cargando comparación…" tone="loading" compact />

  return (
    <div className="space-y-8">
      {current.failedIds.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-destructive/40 bg-card p-4 shadow-[var(--shadow-xs)]" role="alert">
          <p className="text-sm">No se pudieron cargar: {current.failedIds.map((id) => `#${id}`).join(', ')}.</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setRetry((value) => value + 1)}>
            <RefreshCw className="size-4" aria-hidden /> Reintentar
          </Button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {current.data.map((pokemon) => (
          <Link key={pokemon.speciesId} to={`/pokemon/${pokemon.speciesId}`} className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="h-full py-4 transition-colors hover:bg-accent/50">
              <CardContent className="flex flex-col items-center px-3 text-center">
                <div className="flex size-20 items-center justify-center rounded-full bg-secondary">
                  {pokemon.spriteUrl && <img src={pokemon.spriteUrl} alt="" className="size-20 object-contain [image-rendering:pixelated]" />}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">#{String(pokemon.speciesId).padStart(3, '0')}</p>
                <h2 className="font-semibold">{pokemon.name}</h2>
                <div className="mt-2 flex flex-wrap justify-center gap-1">
                  {pokemon.types.map((type) => <TypeChip key={type} type={type} size="compact" />)}
                </div>
                <p className="mt-2 text-sm font-medium">Total {pokemon.total}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {current.data.length >= 2 && (
        <section aria-labelledby="stats-comparison-title">
          <h2 id="stats-comparison-title" className="mb-4 text-xl font-semibold">Estadísticas base</h2>
          <div className="space-y-6">
            {(current.data[0]?.stats ?? []).map((stat) => (
              <section key={stat.name}>
                <h3 className="mb-2 text-sm font-semibold">{translatePokemonStat(stat.name, true)}</h3>
                <ul className="space-y-2">
                  {current.data.map((pokemon) => {
                    const value = pokemon.stats.find((entry) => entry.name === stat.name)?.value ?? 0
                    return (
                      <li key={pokemon.speciesId} className="grid grid-cols-[minmax(5rem,0.8fr)_2fr_2.5rem] items-center gap-2 text-sm">
                        <span className="truncate">{pokemon.name}</span>
                        <span className="h-3 overflow-hidden rounded-full bg-secondary" aria-hidden>
                          <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (value / 180) * 100)}%` }} />
                        </span>
                        <span className="text-right font-medium">{value}</span>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
