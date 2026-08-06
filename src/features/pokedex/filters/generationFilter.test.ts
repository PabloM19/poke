import { describe, expect, it } from 'vitest'
import type { SpeciesIndexItem } from '@/lib/pokedex'
import { filterSpeciesByGeneration } from './generationFilter'

const item = (speciesId: number, generationId: number): SpeciesIndexItem => ({
  speciesId,
  speciesName: `pokemon-${speciesId}`,
  nameEs: `Pokémon ${speciesId}`,
  generationId,
  defaultPokemonName: `pokemon-${speciesId}`,
  speciesUrl: `https://pokeapi.co/api/v2/pokemon-species/${speciesId}/`,
})

describe('filterSpeciesByGeneration', () => {
  const index = [item(1, 1), item(152, 2), item(252, 3), item(387, 4), item(494, 5)]

  it('devuelve todo sin filtro', () => {
    expect(filterSpeciesByGeneration(index, null)).toEqual(index)
  })

  it.each([1, 2, 3, 4, 5] as const)('filtra la generación %s', (generation) => {
    expect(filterSpeciesByGeneration(index, generation)).toEqual([index[generation - 1]])
  })
})
