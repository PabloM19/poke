/**
 * Cache en localStorage con TTL y versionado.
 * Keys: APP_STORAGE_PREFIX + CACHE_VERSION + ":" + parts (distintas de settings).
 */

import { APP_STORAGE_PREFIX, CACHE_VERSION } from '../config'

const CACHE_PREFIX = `${APP_STORAGE_PREFIX}${CACHE_VERSION}:`

export interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export interface CacheWriteIssue {
  key: string
  reason: 'quota' | 'unavailable'
  timestamp: number
}

let lastWriteIssue: CacheWriteIssue | null = null

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.code === 22)
  )
}

function recordWriteIssue(
  key: string,
  reason: CacheWriteIssue['reason']
): void {
  lastWriteIssue = { key, reason, timestamp: Date.now() }
}

export function getCacheWriteIssue(): CacheWriteIssue | null {
  return lastWriteIssue
}

export function clearCacheWriteIssue(): void {
  lastWriteIssue = null
}

/**
 * Construye la key de cache: pokeapp:v3:part1:part2:...
 */
export function makeKey(parts: string[]): string {
  return `${APP_STORAGE_PREFIX}${CACHE_VERSION}:${parts.join(':')}`
}

function clearExpiredEntries(): void {
  const keysToRemove: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key == null || !key.startsWith(CACHE_PREFIX)) continue
      const raw = localStorage.getItem(key)
      if (raw == null) continue
      try {
        const parsed = JSON.parse(raw) as { expiresAt?: number }
        if (
          typeof parsed.expiresAt === 'number' &&
          Date.now() > parsed.expiresAt
        ) {
          keysToRemove.push(key)
        }
      } catch {
        keysToRemove.push(key)
      }
    }
  } catch {
    return
  }
  keysToRemove.forEach((key) => {
    try {
      localStorage.removeItem(key)
    } catch {
      // best effort
    }
  })
}

/**
 * Lee una entrada de cache. Si falla el parse o está expirada, borra la key y retorna null.
 */
export function getCache<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return null
    const parsed = JSON.parse(raw) as { value: unknown; expiresAt?: number }
    if (typeof parsed.expiresAt !== 'number') return null
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(key)
      return null
    }
    return { value: parsed.value as T, expiresAt: parsed.expiresAt }
  } catch {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
    return null
  }
}

/**
 * Guarda en cache con TTL. Si quota exceeded, limpia expiradas y reintenta una vez.
 */
export function setCache<T>(key: string, value: T, ttlMs: number): boolean {
  const expiresAt = Date.now() + ttlMs
  const payload = JSON.stringify({ value, expiresAt })

  try {
    localStorage.setItem(key, payload)
    if (lastWriteIssue?.key === key) clearCacheWriteIssue()
    return true
  } catch (e) {
    if (isQuotaError(e)) {
      clearExpiredEntries()
      try {
        localStorage.setItem(key, payload)
        if (lastWriteIssue?.key === key) clearCacheWriteIssue()
        return true
      } catch {
        recordWriteIssue(key, 'quota')
        return false
      }
    }
    recordWriteIssue(key, 'unavailable')
    return false
  }
}

export function removeCache(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

/**
 * Borra todas las entradas de cache cuya key empiece por el prefijo dado.
 * Ej.: clearCacheByPrefix(makeKey(['pokemon'])) borra pokeapp:v1:pokemon:*
 */
export function clearCacheByPrefix(prefix: string): void {
  const keysToRemove: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key != null && key.startsWith(prefix)) keysToRemove.push(key)
    }
  } catch {
    return
  }
  keysToRemove.forEach((k) => {
    try {
      localStorage.removeItem(k)
    } catch {
      // ignore
    }
  })
}

/** Borra solo la caché API actual, sin tocar preferencias ni índices. */
export function clearApiCache(): void {
  clearCacheByPrefix(CACHE_PREFIX)
  clearCacheWriteIssue()
}
