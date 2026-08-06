import { describe, expect, it } from 'vitest'
import {
  generationForSpeciesId,
  normalizePokemonSummaryItem,
  normalizePokemonSummarySnapshot,
} from './summarySnapshot'

const item = (id: number, generationId: number) => ({
  id,
  name: `pokemon-${id}`,
  nameEs: `Pokémon ${id}`,
  generationId,
  types: ['normal'],
  stats: {
    hp: 45,
    attack: 49,
    defense: 49,
    specialAttack: 65,
    specialDefense: 65,
    speed: 45,
  },
  total: 318,
  sprite: `https://example.test/${id}.png`,
})

const snapshot = (items: unknown[]) => ({
  version: 'v1',
  generatedAt: '2026-08-06T00:00:00.000Z',
  source: 'pokeapi.co',
  count: items.length,
  items,
})

describe('summary snapshot', () => {
  it.each([
    [1, 1], [151, 1], [152, 2], [251, 2], [252, 3], [386, 3],
    [387, 4], [493, 4], [494, 5], [649, 5],
  ])('asigna #%s a la generación %s', (id, generation) => {
    expect(generationForSpeciesId(id)).toBe(generation)
  })

  it('normaliza un DTO válido sin conservar referencias mutables', () => {
    const source = item(1, 1)
    const normalized = normalizePokemonSummaryItem(source)

    expect(normalized).toEqual(source)
    expect(normalized?.types).not.toBe(source.types)
    expect(normalized?.stats).not.toBe(source.stats)
  })

  it('rechaza generación, tipos, total y sprite incoherentes', () => {
    expect(normalizePokemonSummaryItem({ ...item(152, 2), generationId: 1 })).toBeNull()
    expect(normalizePokemonSummaryItem({ ...item(1, 1), types: [] })).toBeNull()
    expect(normalizePokemonSummaryItem({ ...item(1, 1), types: ['grass', 'grass'] })).toBeNull()
    expect(normalizePokemonSummaryItem({ ...item(1, 1), total: 999 })).toBeNull()
    expect(normalizePokemonSummaryItem({ ...item(1, 1), sprite: 'http://example.test/1.png' })).toBeNull()
  })

  it('acepta un snapshot versionado, completo y ordenado', () => {
    const value = snapshot([item(1, 1), item(152, 2)])
    expect(normalizePokemonSummarySnapshot(value, { expectedCount: 2 })).toEqual(value)
  })

  it('rechaza versiones desconocidas, conteos falsos, duplicados y desorden', () => {
    expect(normalizePokemonSummarySnapshot({ ...snapshot([item(1, 1)]), version: 'v0' }, { expectedCount: 1 })).toBeNull()
    expect(normalizePokemonSummarySnapshot({ ...snapshot([item(1, 1)]), count: 2 }, { expectedCount: 1 })).toBeNull()
    expect(normalizePokemonSummarySnapshot(snapshot([item(1, 1), item(1, 1)]), { expectedCount: 2 })).toBeNull()
    expect(normalizePokemonSummarySnapshot(snapshot([item(152, 2), item(1, 1)]), { expectedCount: 2 })).toBeNull()
  })
})
