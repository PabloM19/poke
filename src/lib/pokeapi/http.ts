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
  /** Tiempo máximo por intento. */
  timeoutMs?: number
  /** Reintentos adicionales para fallos de red y respuestas 5xx. */
  retries?: number
  /** Permite compartir peticiones idénticas sin señal externa. */
  dedupe?: boolean
}

const DEFAULT_TIMEOUT_MS = 10_000
const DEFAULT_RETRIES = 2
const MAX_CONCURRENT_REQUESTS = 6
const RETRY_BASE_DELAY_MS = 250

let activeRequests = 0
const waiting: Array<() => void> = []
const inFlight = new Map<string, Promise<unknown>>()

function abortError(path: string, kind: 'abort' | 'timeout'): PokeApiError {
  return new PokeApiError(
    kind === 'timeout' ? 'La petición ha superado el tiempo de espera' : 'Petición cancelada',
    { path, kind }
  )
}

function waitForSlot(signal: AbortSignal | undefined, path: string): Promise<() => void> {
  if (signal?.aborted) return Promise.reject(abortError(path, 'abort'))

  return new Promise((resolve, reject) => {
    let settled = false
    const grant = () => {
      if (settled) return
      settled = true
      signal?.removeEventListener('abort', onAbort)
      activeRequests += 1
      resolve(() => {
        activeRequests -= 1
        waiting.shift()?.()
      })
    }
    const onAbort = () => {
      if (settled) return
      settled = true
      const position = waiting.indexOf(grant)
      if (position >= 0) waiting.splice(position, 1)
      reject(abortError(path, 'abort'))
    }

    if (activeRequests < MAX_CONCURRENT_REQUESTS) grant()
    else {
      waiting.push(grant)
      signal?.addEventListener('abort', onAbort, { once: true })
    }
  })
}

function delay(ms: number, signal: AbortSignal | undefined, path: string): Promise<void> {
  if (signal?.aborted) return Promise.reject(abortError(path, 'abort'))
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      window.clearTimeout(timer)
      reject(abortError(path, 'abort'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function shouldRetry(error: PokeApiError): boolean {
  return error.kind === 'network' || (error.kind === 'http' && (error.status ?? 0) >= 500)
}

async function fetchAttempt<T>(
  url: string,
  path: string,
  signal: AbortSignal | undefined,
  timeoutMs: number
): Promise<T> {
  const release = await waitForSlot(signal, path)
  const controller = new AbortController()
  let timedOut = false
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort, { once: true })
  const timeout = window.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  try {
    let response: Response
    try {
      response = await fetch(url, { signal: controller.signal })
    } catch (error) {
      if (timedOut) throw abortError(path, 'timeout')
      if (signal?.aborted) throw abortError(path, 'abort')
      const message = error instanceof Error ? error.message : 'Network request failed'
      throw new PokeApiError(message, { path, kind: 'network' })
    }

    if (!response.ok) {
      throw new PokeApiError(`HTTP ${response.status}: ${response.statusText}`, {
        path,
        kind: 'http',
        status: response.status,
      })
    }

    let raw: string
    try {
      raw = await response.text()
    } catch (error) {
      if (timedOut) throw abortError(path, 'timeout')
      if (signal?.aborted) throw abortError(path, 'abort')
      const message = error instanceof Error ? error.message : 'Failed to read response'
      throw new PokeApiError(message, { path, kind: 'network' })
    }

    try {
      return JSON.parse(raw) as T
    } catch {
      throw new PokeApiError('Invalid JSON in response', { path, kind: 'parse' })
    }
  } finally {
    window.clearTimeout(timeout)
    signal?.removeEventListener('abort', onAbort)
    release()
  }
}

async function requestWithRetries<T>(
  url: string,
  path: string,
  opts: FetchJsonOptions | undefined
): Promise<T> {
  const retries = Math.max(0, opts?.retries ?? DEFAULT_RETRIES)
  const timeoutMs = Math.max(1, opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS)

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fetchAttempt<T>(url, path, opts?.signal, timeoutMs)
    } catch (error) {
      const typed = error instanceof PokeApiError
        ? error
        : new PokeApiError('Network request failed', { path, kind: 'network' })
      if (attempt >= retries || !shouldRetry(typed)) throw typed
      await delay(RETRY_BASE_DELAY_MS * 2 ** attempt, opts?.signal, path)
    }
  }
}

/**
 * GET path, parsea JSON y retorna Promise<T>.
 * - status no 2xx → PokeApiError (kind: "http", status, path)
 * - JSON inválido → PokeApiError (kind: "parse", path)
 * - fallo de red, cancelación y timeout conservan tipos distintos
 * - limita la concurrencia global y reintenta red/5xx hasta dos veces
 */
export async function fetchJson<T>(
  path: string,
  opts?: FetchJsonOptions
): Promise<T> {
  const url = buildUrl(path, opts?.query)
  const canDedupe = opts?.dedupe !== false && !opts?.signal
  const key = `${url}|${opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS}|${opts?.retries ?? DEFAULT_RETRIES}`
  if (!canDedupe) return requestWithRetries<T>(url, path, opts)

  const existing = inFlight.get(key)
  if (existing) return existing as Promise<T>

  const request = requestWithRetries<T>(url, path, opts).finally(() => {
    if (inFlight.get(key) === request) inFlight.delete(key)
  })
  inFlight.set(key, request)
  return request
}
