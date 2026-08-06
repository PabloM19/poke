import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Pokemon, PokemonSpecies } from '@/lib/pokeapi'

const mocks = vi.hoisted(() => ({ getPokemon: vi.fn(), getPokemonSpecies: vi.fn() }))
vi.mock('@/lib/pokeapi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/pokeapi')>()
  return { ...actual, getPokemon: mocks.getPokemon, getPokemonSpecies: mocks.getPokemonSpecies }
})

import { getComparePokemonData } from './compareData'

const species: PokemonSpecies = {
  id: 35,
  name: 'clefairy',
  names: [{ name: 'Clefairy', language: { name: 'es', url: '' } }],
  generation: { name: 'generation-i', url: '' },
  varieties: [{ is_default: true, pokemon: { name: 'clefairy', url: '' } }],
  evolution_chain: null,
}
const pokemon: Pokemon = {
  id: 35,
  name: 'clefairy',
  sprites: { front_default: null },
  types: [{ slot: 1, type: { name: 'fairy', url: '' } }],
  past_types: [{
    generation: { name: 'generation-v', url: '' },
    types: [{ slot: 1, type: { name: 'normal', url: '' } }],
  }],
  stats: [
    { base_stat: 70, stat: { name: 'hp', url: '' } },
    { base_stat: 48, stat: { name: 'defense', url: '' } },
  ],
  past_stats: [{
    generation: { name: 'generation-v', url: '' },
    stats: [{ base_stat: 45, stat: { name: 'defense', url: '' } }],
  }],
}

beforeEach(() => {
  mocks.getPokemonSpecies.mockReset().mockResolvedValue(species)
  mocks.getPokemon.mockReset().mockResolvedValue(pokemon)
})

describe('getComparePokemonData', () => {
  it('devuelve tipos, stats y total de la generación elegida', async () => {
    const result = await getComparePokemonData(35, 5)
    expect(result.types).toEqual(['normal'])
    expect(result.stats).toEqual([
      { name: 'hp', value: 70 },
      { name: 'defense', value: 45 },
    ])
    expect(result.total).toBe(115)
  })
})
