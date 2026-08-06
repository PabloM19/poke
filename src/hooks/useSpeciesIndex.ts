/**
 * Hook para consumir el Species Index desde UI.
 * No dispara builds; solo lee del storage. Llamar refresh() tras construir/borrar.
 */

import { useCallback, useState } from 'react'
import { getSpeciesIndex, getSpeciesIndexMeta } from '@/lib/pokedex'
import type { SpeciesIndexItem, SpeciesIndexMeta } from '@/lib/pokedex'

function readSnapshot(): { index: SpeciesIndexItem[]; meta: SpeciesIndexMeta | null } {
  const index = getSpeciesIndex()
  const meta = getSpeciesIndexMeta()
  return {
    index: index ?? [],
    meta: meta ?? null,
  }
}

export type SpeciesIndexStatus = 'missing' | 'ready'

export interface UseSpeciesIndexResult {
  index: SpeciesIndexItem[]
  meta: SpeciesIndexMeta | null
  status: SpeciesIndexStatus
  error: null
  refresh: () => void
}

export function useSpeciesIndex(): UseSpeciesIndexResult {
  const [snapshot, setSnapshot] = useState(() => readSnapshot())

  const refresh = useCallback(() => {
    setSnapshot(readSnapshot())
  }, [])

  const status: SpeciesIndexStatus =
    Array.isArray(snapshot.index) && snapshot.index.length > 0 ? 'ready' : 'missing'

  return {
    index: snapshot.index,
    meta: snapshot.meta,
    status,
    error: null,
    refresh,
  }
}
