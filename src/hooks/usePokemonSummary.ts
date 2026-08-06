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
  const [status, setStatus] = useState<PokemonSummaryStatus>('loading')
  const [data, setData] = useState<PokemonSummaryData | null>(null)

  useEffect(() => {
    if (!defaultPokemonName?.trim()) {
      setStatus('error')
      setData(null)
      return
    }

    let cancelled = false
    setStatus('loading')
    setData(null)

    const cachedTotal = speciesId != null ? getCachedTotalStats(speciesId) : null

    getPokemon(defaultPokemonName)
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
        setData({ spriteUrl, types, totalBaseStats })
        setStatus('success')
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error')
          setData(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [defaultPokemonName, speciesId])

  return { status, data }
}
