import { describe, expect, it } from 'vitest'
import {
  getSpanishName,
  getSpeciesIdFromUrl,
} from './services'
import { pikachuSpeciesFixture } from '@/test/fixtures/pokeapi'

describe('helpers de PokeAPI', () => {
  it('extrae el nombre español de una especie', () => {
    expect(getSpanishName(pikachuSpeciesFixture)).toBe('Pikachu')
  })

  it('extrae el id de URLs de especie y recursos genéricos', () => {
    expect(
      getSpeciesIdFromUrl('https://pokeapi.co/api/v2/pokemon-species/25/')
    ).toBe(25)
    expect(getSpeciesIdFromUrl('https://pokeapi.co/api/v2/pokemon/150/')).toBe(
      150
    )
    expect(getSpeciesIdFromUrl('not-a-resource')).toBe(0)
  })
})
