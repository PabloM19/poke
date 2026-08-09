import { describe, expect, it } from 'vitest'
import { POKEMON_TYPE_SLUGS, TYPE_STYLES } from './typeStyles'

function luminance(hex: string): number {
  const channels = hex.slice(1).match(/../g)?.map((value) => Number.parseInt(value, 16) / 255) ?? []
  const linear = channels.map((value) => value <= 0.03928
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4)
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

function contrast(first: string, second: string): number {
  const a = luminance(first)
  const b = luminance(second)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

describe('TYPE_STYLES', () => {
  it('contiene una definición única para los 18 tipos', () => {
    expect(POKEMON_TYPE_SLUGS).toHaveLength(18)
    expect(Object.keys(TYPE_STYLES)).toEqual([...POKEMON_TYPE_SLUGS])
  })

  it('garantiza contraste AA en chips sólidos', () => {
    for (const definition of Object.values(TYPE_STYLES)) {
      expect(contrast(definition.solid, definition.foreground)).toBeGreaterThanOrEqual(4.5)
    }
  })
})
