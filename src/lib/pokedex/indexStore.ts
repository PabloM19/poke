/**
 * Lectura y borrado del índice de especies.
 * No lanza el build; eso lo hace la UI.
 */

import { APP_STORAGE_PREFIX } from '../config'
import { getStored } from '../storage'
import type { SpeciesIndexItem, SpeciesIndexMeta } from './indexTypes'

export const SPECIES_INDEX_VERSION = 'v2'
export const KEY_INDEX = 'index:species:v2'
export const KEY_META = 'index:species:meta:v2'
export const KEY_PARTIAL = 'index:species:partial:v2'

function isIndexItem(value: unknown): value is SpeciesIndexItem {
  if (typeof value !== 'object' || value == null) return false
  const item = value as Partial<SpeciesIndexItem>
  return Number.isInteger(item.speciesId) && (item.speciesId ?? 0) > 0 &&
    typeof item.speciesName === 'string' && typeof item.nameEs === 'string' &&
    Number.isInteger(item.generationId) && (item.generationId ?? 0) > 0 &&
    typeof item.defaultPokemonName === 'string' && typeof item.speciesUrl === 'string'
}

export function isSpeciesIndexReady(
  index: SpeciesIndexItem[] | null,
  meta: SpeciesIndexMeta | null,
  maxGen?: number
): index is SpeciesIndexItem[] {
  if (!index || !meta || meta.version !== SPECIES_INDEX_VERSION || index.length === 0) return false
  if (maxGen != null && meta.maxGen !== maxGen) return false
  if (meta.counts.species !== index.length || !index.every(isIndexItem)) return false
  return new Set(index.map((item) => item.speciesId)).size === index.length
}

export function getSpeciesIndex(): SpeciesIndexItem[] | null {
  return getStored<SpeciesIndexItem[]>(KEY_INDEX)
}

export function getSpeciesIndexMeta(): SpeciesIndexMeta | null {
  return getStored<SpeciesIndexMeta>(KEY_META)
}

export function clearSpeciesIndex(): void {
  try {
    localStorage.removeItem(APP_STORAGE_PREFIX + KEY_INDEX)
    localStorage.removeItem(APP_STORAGE_PREFIX + KEY_META)
    localStorage.removeItem(APP_STORAGE_PREFIX + KEY_PARTIAL)
    localStorage.removeItem(APP_STORAGE_PREFIX + 'index:species:v1')
    localStorage.removeItem(APP_STORAGE_PREFIX + 'index:species:meta:v1')
    localStorage.removeItem(APP_STORAGE_PREFIX + 'index:species:partial:v1')
  } catch {
    // best effort
  }
}

/**
 * Devuelve el índice si existe y su meta coincide con maxGen.
 * Si no existe o no coincide, devuelve null (no inicia build).
 */
export function ensureSpeciesIndex(opts: { maxGen: number }): SpeciesIndexItem[] | null {
  const meta = getSpeciesIndexMeta()
  const index = getSpeciesIndex()
  return isSpeciesIndexReady(index, meta, opts.maxGen) ? index : null
}
