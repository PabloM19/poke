import { describe, expect, it } from 'vitest'
import { pokemonSummarySnapshot } from './summaryData'

describe('bundled pokemon summary snapshot', () => {
  it('distribuye exactamente las 649 especies de Generaciones I–V', () => {
    expect(pokemonSummarySnapshot.count).toBe(649)
    expect(pokemonSummarySnapshot.items[0]).toMatchObject({ id: 1, name: 'bulbasaur', generationId: 1 })
    expect(pokemonSummarySnapshot.items.at(-1)).toMatchObject({ id: 649, name: 'genesect', generationId: 5 })
  })

  it('incluye tipos, stats, total y sprite normalizados', () => {
    expect(pokemonSummarySnapshot.items[24]).toMatchObject({
      id: 25,
      name: 'pikachu',
      types: ['electric'],
      total: 320,
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    })
  })
})
