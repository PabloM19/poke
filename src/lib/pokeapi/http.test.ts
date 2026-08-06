import { describe, expect, it } from 'vitest'
import { buildUrl } from './http'

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
})
