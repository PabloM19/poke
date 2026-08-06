/**
 * Capa de almacenamiento y cache.
 * - Settings: preferencias (prefijo pokeapp:, sin versión).
 * - Cache: datos con TTL (prefijo pokeapp:v1:, versionado).
 */

export {
  getSetting,
  setSetting,
  getStored,
  setStored,
} from './settings'

export {
  getCache,
  setCache,
  removeCache,
  clearCacheByPrefix,
  makeKey,
  type CacheEntry,
} from './localCache'
