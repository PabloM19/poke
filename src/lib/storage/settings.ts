/**
 * Preferencias de usuario (settings).
 * Keys: APP_STORAGE_PREFIX + key (sin versión; distintas del cache que usa makeKey).
 */

import { APP_STORAGE_PREFIX } from '../config'

function prefixedKey(key: string): string {
  return `${APP_STORAGE_PREFIX}${key}`
}

const VALID: Record<string, readonly string[]> = {
  theme: ['light', 'dark'] as const,
  defaultView: ['grid', 'list'] as const,
  spoilerLevel: ['none', 'mechanics', 'guide'] as const,
}

function isValid(key: string, value: unknown): boolean {
  const allowed = VALID[key]
  return Array.isArray(allowed) && typeof value === 'string' && allowed.includes(value)
}

export function getSetting(key: 'theme', fallback: 'light' | 'dark'): 'light' | 'dark'
export function getSetting(key: 'defaultView', fallback: 'grid' | 'list'): 'grid' | 'list'
export function getSetting(key: 'spoilerLevel', fallback: 'none' | 'mechanics' | 'guide'): 'none' | 'mechanics' | 'guide'
export function getSetting(key: string, fallback: string): string {
  try {
    const raw = localStorage.getItem(prefixedKey(key))
    if (raw == null) return fallback
    const value = JSON.parse(raw) as unknown
    return isValid(key, value) ? (value as string) : fallback
  } catch {
    return fallback
  }
}

export function setSetting(key: 'theme', value: 'light' | 'dark'): void
export function setSetting(key: 'defaultView', value: 'grid' | 'list'): void
export function setSetting(key: 'spoilerLevel', value: 'none' | 'mechanics' | 'guide'): void
export function setSetting(key: string, value: string): void {
  if (!isValid(key, value)) return
  try {
    localStorage.setItem(prefixedKey(key), JSON.stringify(value))
  } catch {
    // ignore
  }
}

/** Get genérico con prefijo de app (para datos que no son cache versionado). */
export function getStored<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(prefixedKey(key))
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

/** Set genérico con prefijo de app. */
export function setStored<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(prefixedKey(key), JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeStored(key: string): boolean {
  try {
    localStorage.removeItem(prefixedKey(key))
    return true
  } catch {
    return false
  }
}
