import { getStored, removeStored, setStored } from '@/lib/storage'

const STORAGE_KEY = 'favorites:v1'
const STORE_VERSION = 1
export const MAX_FAVORITE_SPECIES_ID = 649
export const FAVORITES_CHANGED_EVENT = 'pokeapp:favorites-changed'

interface FavoritesPayload {
  version: 1
  speciesIds: number[]
  updatedAt: number
}

function isValidSpeciesId(value: unknown): value is number {
  return Number.isSafeInteger(value) &&
    (value as number) >= 1 &&
    (value as number) <= MAX_FAVORITE_SPECIES_ID
}

function notifyFavoritesChanged(): void {
  window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT))
}

function persist(speciesIds: readonly number[]): boolean {
  const saved = setStored<FavoritesPayload>(STORAGE_KEY, {
    version: STORE_VERSION,
    speciesIds: [...speciesIds],
    updatedAt: Date.now(),
  })
  if (saved) notifyFavoritesChanged()
  return saved
}

export function getFavoriteSpeciesIds(): readonly number[] {
  const raw = getStored<unknown>(STORAGE_KEY)
  if (raw == null) {
    removeStored(STORAGE_KEY)
    return []
  }
  if (typeof raw !== 'object') {
    removeStored(STORAGE_KEY)
    return []
  }
  const payload = raw as Partial<FavoritesPayload>
  if (payload.version !== STORE_VERSION || !Array.isArray(payload.speciesIds)) {
    removeStored(STORAGE_KEY)
    return []
  }

  const cleaned = [...new Set(payload.speciesIds.filter(isValidSpeciesId))]
  if (cleaned.length !== payload.speciesIds.length) persist(cleaned)
  return cleaned
}

export function isFavoriteSpecies(speciesId: number): boolean {
  return isValidSpeciesId(speciesId) && getFavoriteSpeciesIds().includes(speciesId)
}

export function addFavoriteSpecies(speciesId: number): boolean {
  if (!isValidSpeciesId(speciesId)) return false
  const current = getFavoriteSpeciesIds()
  if (current.includes(speciesId)) return true
  return persist([...current, speciesId])
}

export function removeFavoriteSpecies(speciesId: number): boolean {
  if (!isValidSpeciesId(speciesId)) return false
  const current = getFavoriteSpeciesIds()
  if (!current.includes(speciesId)) return true
  return persist(current.filter((id) => id !== speciesId))
}

export function toggleFavoriteSpecies(speciesId: number): {
  saved: boolean
  isFavorite: boolean
} {
  if (isFavoriteSpecies(speciesId)) {
    const saved = removeFavoriteSpecies(speciesId)
    return { saved, isFavorite: saved ? false : true }
  }
  const saved = addFavoriteSpecies(speciesId)
  return { saved, isFavorite: saved }
}

export function clearFavorites(): boolean {
  const removed = removeStored(STORAGE_KEY)
  if (removed) notifyFavoritesChanged()
  return removed
}
