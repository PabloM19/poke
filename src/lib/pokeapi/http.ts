/**
 * Cliente HTTP base para PokeAPI: construcción de URL y fetch con JSON.
 */

import { POKEAPI_BASE_URL } from '../config'
import { PokeApiError } from './errors'

/**
 * Construye la URL absoluta: POKEAPI_BASE_URL + path, con query opcional.
 * path puede ser "/pokemon/1" o "pokemon/1"; se evita doble barra.
 */
export function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined>
): string {
  const base = POKEAPI_BASE_URL.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(base + normalizedPath)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

export interface FetchJsonOptions {
  signal?: AbortSignal
  query?: Record<string, string | number | boolean | undefined>
}

/**
 * GET path, parsea JSON y retorna Promise<T>.
 * - status no 2xx → PokeApiError (kind: "http", status, path)
 * - JSON inválido → PokeApiError (kind: "parse", path)
 * - fallo de red / abort → PokeApiError (kind: "network", path)
 */
export async function fetchJson<T>(
  path: string,
  opts?: FetchJsonOptions
): Promise<T> {
  const url = buildUrl(path, opts?.query)
  const pathForError = path

  let response: Response
  try {
    response = await fetch(url, { signal: opts?.signal })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Network request failed'
    throw new PokeApiError(message, { path: pathForError, kind: 'network' })
  }

  if (!response.ok) {
    throw new PokeApiError(
      `HTTP ${response.status}: ${response.statusText}`,
      { path: pathForError, kind: 'http', status: response.status }
    )
  }

  let raw: string
  try {
    raw = await response.text()
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to read response'
    throw new PokeApiError(message, { path: pathForError, kind: 'network' })
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    throw new PokeApiError('Invalid JSON in response', {
      path: pathForError,
      kind: 'parse',
    })
  }
}
