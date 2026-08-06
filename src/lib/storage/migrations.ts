import { APP_STORAGE_PREFIX, CACHE_VERSION } from '../config'

const VERSIONED_CACHE_PATTERN = /^pokeapp:v\d+:/

/**
 * Elimina únicamente cachés de versiones antiguas. No toca preferencias,
 * favoritos ni índices de dominio.
 */
export function initializeStorage(): number {
  const currentPrefix = `${APP_STORAGE_PREFIX}${CACHE_VERSION}:`
  const keysToRemove: string[] = []

  try {
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index)
      if (
        key &&
        VERSIONED_CACHE_PATTERN.test(key) &&
        !key.startsWith(currentPrefix)
      ) {
        keysToRemove.push(key)
      }
    }

    for (const key of keysToRemove) localStorage.removeItem(key)
    for (const key of [
      'index:species:v1',
      'index:species:meta:v1',
      'index:species:partial:v1',
    ]) {
      const fullKey = `${APP_STORAGE_PREFIX}${key}`
      if (localStorage.getItem(fullKey) != null) {
        localStorage.removeItem(fullKey)
        keysToRemove.push(fullKey)
      }
    }
  } catch {
    return 0
  }

  return keysToRemove.length
}
