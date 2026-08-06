import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getStored } from '../storage'
import type { PokemonSpecies } from '../pokeapi'
import { KEY_INDEX, KEY_META, KEY_PARTIAL } from './indexStore'

const mocks = vi.hoisted(() => ({
  getGeneration: vi.fn(),
  getPokemonSpecies: vi.fn(),
}))

vi.mock('../pokeapi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../pokeapi')>()
  return {
    ...actual,
    getGeneration: mocks.getGeneration,
    getPokemonSpecies: mocks.getPokemonSpecies,
  }
})

import { buildSpeciesIndex, SpeciesIndexBuildError } from './indexBuilder'

function species(id: number, name: string): PokemonSpecies {
  return {
    id,
    name,
    generation: { name: 'generation-i', url: 'https://pokeapi.co/api/v2/generation/1/' },
    names: [{ name: name[0].toUpperCase() + name.slice(1), language: { name: 'es', url: '' } }],
    varieties: [{
      is_default: true,
      pokemon: { name, url: `https://pokeapi.co/api/v2/pokemon/${id}/` },
    }],
    evolution_chain: null,
  }
}

beforeEach(() => {
  localStorage.clear()
  mocks.getGeneration.mockReset().mockResolvedValue({
    id: 1,
    name: 'generation-i',
    pokemon_species: [
      { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
      { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
    ],
    types: [],
  })
  mocks.getPokemonSpecies.mockReset().mockImplementation((id: number) =>
    Promise.resolve(id === 1 ? species(1, 'bulbasaur') : species(2, 'ivysaur'))
  )
})

describe('buildSpeciesIndex', () => {
  it('solo publica un índice completo con metadatos v2', async () => {
    const result = await buildSpeciesIndex({ maxGen: 1, concurrency: 2 })

    expect(result.map((item) => item.speciesId)).toEqual([1, 2])
    expect(getStored(KEY_INDEX)).toEqual(result)
    expect(getStored(KEY_META)).toMatchObject({
      maxGen: 1,
      counts: { species: 2 },
      version: 'v2',
    })
    expect(getStored(KEY_PARTIAL)).toBeNull()
  })

  it('guarda parcial y no publica un índice si falla una especie', async () => {
    mocks.getPokemonSpecies.mockImplementation((id: number) =>
      id === 1 ? Promise.resolve(species(1, 'bulbasaur')) : Promise.reject(new Error('offline'))
    )

    await expect(buildSpeciesIndex({ maxGen: 1, concurrency: 1 })).rejects.toMatchObject({
      kind: 'incomplete',
      failedSpeciesIds: [2],
    })
    expect(getStored(KEY_INDEX)).toBeNull()
    expect(getStored(KEY_META)).toBeNull()
    expect(getStored<{ items: Array<{ speciesId: number }> }>(KEY_PARTIAL)?.items)
      .toEqual([expect.objectContaining({ speciesId: 1 })])
  })

  it('reanuda desde el parcial y solicita solo las especies pendientes', async () => {
    mocks.getPokemonSpecies.mockImplementation((id: number) =>
      id === 1 ? Promise.resolve(species(1, 'bulbasaur')) : Promise.reject(new Error('offline'))
    )
    await expect(buildSpeciesIndex({ maxGen: 1, concurrency: 1 }))
      .rejects.toMatchObject({ kind: 'incomplete' })

    mocks.getPokemonSpecies.mockClear()
    expect(mocks.getPokemonSpecies).not.toHaveBeenCalled()
    mocks.getPokemonSpecies.mockImplementation((id: number) =>
      Promise.resolve(species(id, id === 1 ? 'bulbasaur' : 'ivysaur'))
    )
    await expect(buildSpeciesIndex({ maxGen: 1, concurrency: 1 })).resolves.toHaveLength(2)
    expect(mocks.getPokemonSpecies.mock.calls.map(([id]) => id)).toEqual([2])
  })

  it('distingue la cancelación y conserva el avance', async () => {
    const controller = new AbortController()

    const promise = buildSpeciesIndex({
      maxGen: 1,
      concurrency: 1,
      signal: controller.signal,
      onProgress: (progress) => {
        if (progress.phase === 'species' && progress.done === 1) controller.abort()
      },
    })

    await expect(promise).rejects.toBeInstanceOf(SpeciesIndexBuildError)
    await expect(promise).rejects.toMatchObject({ kind: 'abort' })
    expect(getStored<{ items: Array<{ speciesId: number }> }>(KEY_PARTIAL)?.items)
      .toEqual([expect.objectContaining({ speciesId: 1 })])
    expect(getStored(KEY_INDEX)).toBeNull()
  })
})
