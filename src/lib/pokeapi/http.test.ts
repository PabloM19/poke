import { afterEach, describe, expect, it, vi } from 'vitest'
import { PokeApiError } from './errors'
import { buildUrl, fetchJson } from './http'

function jsonResponse(value: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  })
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('buildUrl', () => {
  it('normaliza la ruta sin crear dobles barras', () => {
    expect(buildUrl('pokemon/25')).toBe(
      'https://pokeapi.co/api/v2/pokemon/25'
    )
    expect(buildUrl('/pokemon/25')).toBe(
      'https://pokeapi.co/api/v2/pokemon/25'
    )
  })

  it('añade query params y omite valores undefined', () => {
    const url = new URL(
      buildUrl('/pokemon', { limit: 20, offset: 40, unused: undefined })
    )

    expect(url.searchParams.get('limit')).toBe('20')
    expect(url.searchParams.get('offset')).toBe('40')
    expect(url.searchParams.has('unused')).toBe(false)
  })

  it('deduplica peticiones idénticas que están en vuelo', async () => {
    let resolveFetch!: (value: Response) => void
    const fetchMock = vi.fn(() => new Promise<Response>((resolve) => {
      resolveFetch = resolve
    }))
    vi.stubGlobal('fetch', fetchMock)

    const first = fetchJson<{ id: number }>('/pokemon/25')
    const second = fetchJson<{ id: number }>('/pokemon/25')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    resolveFetch(jsonResponse({ id: 25 }))

    await expect(Promise.all([first, second])).resolves.toEqual([{ id: 25 }, { id: 25 }])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('reintenta fallos de red y 5xx, pero no errores 4xx', async () => {
    vi.useFakeTimers()
    const networkFetch = vi.fn()
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', networkFetch)
    const recovered = fetchJson<{ ok: boolean }>('/pokemon/1')
    await vi.runAllTimersAsync()
    await expect(recovered).resolves.toEqual({ ok: true })
    expect(networkFetch).toHaveBeenCalledTimes(2)

    const notFoundFetch = vi.fn().mockResolvedValue(
      new Response('{}', { status: 404, statusText: 'Not Found' })
    )
    vi.stubGlobal('fetch', notFoundFetch)
    await expect(fetchJson('/pokemon/0')).rejects.toMatchObject({
      kind: 'http',
      status: 404,
    })
    expect(notFoundFetch).toHaveBeenCalledTimes(1)
  })

  it('distingue una cancelación externa de un timeout', async () => {
    const cancelled = new AbortController()
    cancelled.abort()
    await expect(fetchJson('/pokemon/2', { signal: cancelled.signal }))
      .rejects.toMatchObject({ kind: 'abort' })

    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_: string, init?: RequestInit) =>
      new Promise<Response>((_, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      })
    ))
    const timedOut = fetchJson('/pokemon/3', { timeoutMs: 50, retries: 0 })
    const assertion = expect(timedOut).rejects.toMatchObject({ kind: 'timeout' })
    await vi.advanceTimersByTimeAsync(50)
    await assertion
  })

  it('no ejecuta más de seis peticiones simultáneas', async () => {
    const resolvers: Array<(value: Response) => void> = []
    let active = 0
    let maximum = 0
    vi.stubGlobal('fetch', vi.fn(() => {
      active += 1
      maximum = Math.max(maximum, active)
      return new Promise<Response>((resolve) => {
        resolvers.push((value) => {
          active -= 1
          resolve(value)
        })
      })
    }))

    const requests = Array.from({ length: 8 }, (_, index) =>
      fetchJson<{ index: number }>(`/pokemon/${index + 10}`, { retries: 0 })
    )
    await vi.waitFor(() => expect(resolvers).toHaveLength(6))
    resolvers[0](jsonResponse({ index: 0 }))
    await vi.waitFor(() => expect(resolvers).toHaveLength(7))
    resolvers[1](jsonResponse({ index: 1 }))
    await vi.waitFor(() => expect(resolvers).toHaveLength(8))
    for (let index = 2; index < resolvers.length; index += 1) {
      resolvers[index](jsonResponse({ index }))
    }

    await Promise.all(requests)
    expect(maximum).toBe(6)
  })

  it('conserva los errores de parseo sin reintentar', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response('no-json')))
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchJson('/pokemon/4')).rejects.toBeInstanceOf(PokeApiError)
    await expect(fetchJson('/pokemon/5')).rejects.toMatchObject({ kind: 'parse' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
