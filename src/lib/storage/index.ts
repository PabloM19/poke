/**
 * Capa de almacenamiento y cache.
 * - Settings: preferencias (prefijo pokeapp:, sin versión).
 * - Cache: datos con TTL (prefijo pokeapp:v2:, versionado).
 */

export {
  getSetting,
  setSetting,
  getStored,
  setStored,
  removeStored,
} from './settings'

export {
  getCache,
  setCache,
  removeCache,
  clearCacheByPrefix,
  clearApiCache,
  makeKey,
  getCacheWriteIssue,
  clearCacheWriteIssue,
  type CacheEntry,
  type CacheWriteIssue,
} from './localCache'

export { initializeStorage } from './migrations'
