/**
 * Resumen de Pokémon para cards: sprite, tipos, total base stats.
 * Usa getPokemon (cacheado). Persiste totalBaseStats por speciesId para no recalcular.
 */

import { useEffect, useState } from 'react'
import { getPokemon } from '@/lib/pokeapi'
import { getStored, setStored } from '@/lib/storage'

const TOTAL_STATS_KEY_PREFIX = 'pokedex:totalStat:v1:'

export interface PokemonSummaryData {
  spriteUrl: string | null
  types: string[]
  totalBaseStats: number
}

export type PokemonSummaryStatus = 'loading' | 'success' | 'error'

export interface UsePokemonSummaryResult {
  status: PokemonSummaryStatus
  data: PokemonSummaryData | null
}

function getCachedTotalStats(speciesId: number): number | null {
  return getStored<number>(TOTAL_STATS_KEY_PREFIX + speciesId)
}

function setCachedTotalStats(speciesId: number, total: number): void {
  setStored(TOTAL_STATS_KEY_PREFIX + speciesId, total)
}

export function usePokemonSummary(
  defaultPokemonName: string | null,
  speciesId?: number
): UsePokemonSummaryResult {
  const pokemonName = defaultPokemonName?.trim() ?? ''
  const requestKey = pokemonName ? `${pokemonName}:${speciesId ?? ''}` : null
  const [result, setResult] = useState<{
    key: string
    status: PokemonSummaryStatus
    data: PokemonSummaryData | null
  } | null>(null)

  useEffect(() => {
    if (!requestKey) return

    let cancelled = false
    const controller = new AbortController()

    const cachedTotal = speciesId != null ? getCachedTotalStats(speciesId) : null

    getPokemon(pokemonName, { signal: controller.signal })
      .then((pokemon) => {
        if (cancelled) return
        const spriteUrl = pokemon.sprites?.front_default ?? null
        const types = pokemon.types?.map((t) => t.type.name) ?? []
        const totalBaseStats =
          cachedTotal ??
          pokemon.stats?.reduce((sum, s) => sum + (s.base_stat ?? 0), 0) ??
          0
        if (speciesId != null && cachedTotal == null) {
          setCachedTotalStats(speciesId, totalBaseStats)
        }
        setResult({
          key: requestKey,
          status: 'success',
          data: { spriteUrl, types, totalBaseStats },
        })
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ key: requestKey, status: 'error', data: null })
        }
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [pokemonName, requestKey, speciesId])

  if (!requestKey) return { status: 'error', data: null }
  if (result?.key !== requestKey) return { status: 'loading', data: null }
  return { status: result.status, data: result.data }
}
