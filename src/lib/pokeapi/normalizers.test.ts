import { describe, expect, it } from 'vitest'
import { PokeApiError } from './errors'
import { normalizePokemon, normalizePokemonSpecies } from './normalizers'
import {
  pikachuPokemonFixture,
  pikachuSpeciesFixture,
} from '@/test/fixtures/pokeapi'

describe('normalizadores PokeAPI', () => {
  it('descarta campos grandes que la app no utiliza', () => {
    const normalized = normalizePokemon(
      {
        ...pikachuPokemonFixture,
        moves: Array.from({ length: 200 }, (_, index) => ({ index })),
        abilities: [{ ability: { name: 'static' } }],
        sprites: {
          ...pikachuPokemonFixture.sprites,
          versions: { huge: { nested: 'payload' } },
        },
      },
      '/pokemon/pikachu'
    )

    expect(normalized).toEqual(pikachuPokemonFixture)
    expect(normalized).not.toHaveProperty('moves')
    expect(normalized).not.toHaveProperty('abilities')
    expect(normalized.sprites).not.toHaveProperty('versions')
  })

  it('mantiene solo la información mínima de especie', () => {
    const normalized = normalizePokemonSpecies(
      {
        ...pikachuSpeciesFixture,
        flavor_text_entries: Array.from({ length: 100 }, () => ({
          flavor_text: 'texto grande',
        })),
      },
      '/pokemon-species/pikachu'
    )

    expect(normalized).toEqual(pikachuSpeciesFixture)
    expect(normalized).not.toHaveProperty('flavor_text_entries')
  })

  it('rechaza respuestas con una estructura inválida', () => {
    expect(() =>
      normalizePokemon({ id: '25' }, '/pokemon/pikachu')
    ).toThrowError(PokeApiError)
  })
})
