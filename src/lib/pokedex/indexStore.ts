/**
 * Lectura y borrado del índice de especies.
 * No lanza el build; eso lo hace la UI.
 */

import { APP_STORAGE_PREFIX } from '../config'
import { getStored } from '../storage'
import type { SpeciesIndexItem, SpeciesIndexMeta } from './indexTypes'

export const KEY_INDEX = 'index:species:v1'
export const KEY_META = 'index:species:meta:v1'
export const KEY_PARTIAL = 'index:species:partial:v1'

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
  if (!meta || !index || meta.maxGen !== opts.maxGen) return null
  return index
}

