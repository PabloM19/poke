import { useCallback, useEffect, useState } from 'react'
import type { MainGameContext } from '@/features/games/gameCatalog'
import { getRegionalPokedex, speciesId } from '@/features/manuals/mainGames/gameDataServices'
import {
  pokemonSummarySnapshot,
  type PokemonSummaryItem,
} from './summary'

export type RegionalPokedexItemsStatus = 'success' | 'loading' | 'error'

export interface RegionalPokedexItemsResult {
  status: RegionalPokedexItemsStatus
  items: PokemonSummaryItem[]
  /** Número local de cada especie en la Pokédex del juego activo. */
  entryNumbers: ReadonlyMap<number, number>
  /** Número de entradas que devuelve PokeAPI para ese contexto. */
  entryCount: number
  retry: () => void
}

const nationalFallback: RegionalPokedexItemsResult = {
  status: 'success',
  items: pokemonSummarySnapshot.items,
  entryNumbers: new Map(pokemonSummarySnapshot.items.map((item, index) => [item.id, index + 1])),
  entryCount: pokemonSummarySnapshot.items.length,
  retry: () => undefined,
}

interface InternalRegionalState extends RegionalPokedexItemsResult {
  key: string
}

function loadingState(key: string, retry: () => void): InternalRegionalState {
  return {
    key,
    status: 'loading',
    items: [],
    entryNumbers: new Map(),
    entryCount: 0,
    retry,
  }
}

/**
 * Resuelve la lista regional desde el mismo servicio PokeAPI que utilizan las
 * guías por juego. La caché del servicio incluye el nombre de la Pokédex, así
 * que cambiar entre Perla/Platino/Negro 2 no reutiliza la lista anterior.
 */
export function useRegionalPokedexItems(game: MainGameContext | null): RegionalPokedexItemsResult {
  const [revision, setRevision] = useState(0)
  const requestKey = game == null ? 'national' : `${game.slug}:${revision}`
  const retry = useCallback(() => setRevision((value) => value + 1), [])
  const [state, setState] = useState<InternalRegionalState>(() => (
    game == null ? { ...nationalFallback, key: 'national' } : loadingState(requestKey, retry)
  ))

  useEffect(() => {
    if (game == null) {
      return
    }

    const controller = new AbortController()

    getRegionalPokedex(game, { signal: controller.signal })
      .then((regional) => {
        if (controller.signal.aborted) return
        const summaryById = new Map(pokemonSummarySnapshot.items.map((item) => [item.id, item]))
        const entryNumbers = new Map<number, number>()
        const items: PokemonSummaryItem[] = []

        for (const entry of regional.entries) {
          const id = speciesId(entry.species)
          const item = summaryById.get(id)
          if (item == null) continue
          entryNumbers.set(id, entry.entryNumber)
          items.push(item)
        }

        setState({
          key: requestKey,
          status: 'success',
          items,
          entryNumbers,
          entryCount: items.length,
          retry,
        })
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setState({
          key: requestKey,
          status: 'error',
          items: [],
          entryNumbers: new Map(),
          entryCount: 0,
          retry,
        })
      })

    return () => controller.abort()
  }, [game, requestKey, retry])

  if (game == null) return nationalFallback
  return state.key === requestKey ? state : loadingState(requestKey, retry)
}
