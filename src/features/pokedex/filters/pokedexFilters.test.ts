import { describe, expect, it } from 'vitest'
import { pokemonSummarySnapshot } from '@/features/pokedex/summary'
import { filterAndSortPokemon, getTotalBounds, type PokedexFilters } from './pokedexFilters'

const defaults: PokedexFilters = {
  generation: null,
  types: [],
  minTotal: 180,
  maxTotal: 720,
  sort: 'number-asc',
}

describe('pokedex filters', () => {
  const items = pokemonSummarySnapshot.items

  it('calcula los límites reales del snapshot', () => {
    expect(getTotalBounds(items)).toEqual({ min: 180, max: 720 })
  })

  it('combina generación, dos tipos y rango inclusivo', () => {
    const result = filterAndSortPokemon(items, {
      ...defaults,
      generation: 1,
      types: ['grass', 'poison'],
      minTotal: 300,
      maxTotal: 500,
    })

    expect(result.map((item) => item.name)).toContain('bulbasaur')
    expect(result.every((item) => (
      item.generationId === 1
      && item.types.includes('grass')
      && item.types.includes('poison')
      && item.total >= 300
      && item.total <= 500
    ))).toBe(true)
  })

  it('ordena por nombre y por total con desempate estable por número', () => {
    const byName = filterAndSortPokemon(items, { ...defaults, sort: 'name-asc' })
    const byTotal = filterAndSortPokemon(items, { ...defaults, sort: 'total-desc' })

    expect(byName[0].name).toBe('abomasnow')
    expect(byTotal[0]).toMatchObject({ name: 'arceus', total: 720 })
    expect(byTotal.at(-1)).toMatchObject({ name: 'sunkern', total: 180 })
  })

  it('no muta el snapshot original', () => {
    const firstIds = items.slice(0, 3).map((item) => item.id)
    filterAndSortPokemon(items, { ...defaults, sort: 'total-desc' })
    expect(items.slice(0, 3).map((item) => item.id)).toEqual(firstIds)
  })
})
