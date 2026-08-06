import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearApiCache,
  clearCacheWriteIssue,
  getCache,
  getCacheWriteIssue,
  makeKey,
  setCache,
} from './localCache'

describe('localCache', () => {
  beforeEach(() => {
    clearCacheWriteIssue()
  })

  it('usa la versión v3 en las claves', () => {
    expect(makeKey(['pokemon', 'pikachu'])).toBe(
      'pokeapp:v3:pokemon:pikachu'
    )
  })

  it('guarda y recupera una entrada válida', () => {
    const key = makeKey(['test'])

    expect(setCache(key, { ok: true }, 60_000)).toBe(true)
    expect(getCache<{ ok: boolean }>(key)?.value).toEqual({ ok: true })
  })

  it('elimina entradas corruptas', () => {
    const key = makeKey(['corrupt'])
    localStorage.setItem(key, '{not-json')

    expect(getCache(key)).toBeNull()
    expect(localStorage.getItem(key)).toBeNull()
  })

  it('informa cuando la cuota impide persistir', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })

    const key = makeKey(['too-large'])
    expect(setCache(key, { huge: true }, 60_000)).toBe(false)
    expect(getCacheWriteIssue()).toMatchObject({ key, reason: 'quota' })
  })

  it('borra solo la caché API actual', () => {
    localStorage.setItem(makeKey(['pokemon', '25']), '{}')
    localStorage.setItem('pokeapp:theme', '"dark"')
    localStorage.setItem('pokeapp:index:species:v2', '[]')

    clearApiCache()

    expect(localStorage.getItem(makeKey(['pokemon', '25']))).toBeNull()
    expect(localStorage.getItem('pokeapp:theme')).toBe('"dark"')
    expect(localStorage.getItem('pokeapp:index:species:v2')).toBe('[]')
  })
})
