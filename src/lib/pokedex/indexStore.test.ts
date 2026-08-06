import { describe, expect, it } from 'vitest'
import { setStored } from '../storage'
import {
  ensureSpeciesIndex,
  isSpeciesIndexReady,
  KEY_INDEX,
  KEY_META,
} from './indexStore'
import type { SpeciesIndexItem, SpeciesIndexMeta } from './indexTypes'

const item: SpeciesIndexItem = {
  speciesId: 1,
  speciesName: 'bulbasaur',
  nameEs: 'Bulbasaur',
  generationId: 1,
  defaultPokemonName: 'bulbasaur',
  speciesUrl: 'https://pokeapi.co/api/v2/pokemon-species/1/',
}

describe('integridad del Species Index', () => {
  it('rechaza metadatos ausentes, conteos falsos y duplicados', () => {
    const validMeta: SpeciesIndexMeta = {
      timestamp: Date.now(),
      maxGen: 5,
      counts: { species: 1 },
      version: 'v2',
    }
    expect(isSpeciesIndexReady([item], null)).toBe(false)
    expect(isSpeciesIndexReady([item], { ...validMeta, counts: { species: 2 } })).toBe(false)
    expect(isSpeciesIndexReady([item, item], { ...validMeta, counts: { species: 2 } })).toBe(false)
    expect(isSpeciesIndexReady([item], validMeta, 5)).toBe(true)
  })

  it('ensureSpeciesIndex solo devuelve snapshots coherentes', () => {
    setStored(KEY_INDEX, [item])
    setStored(KEY_META, {
      timestamp: Date.now(),
      maxGen: 5,
      counts: { species: 1 },
      version: 'v2',
    } satisfies SpeciesIndexMeta)
    expect(ensureSpeciesIndex({ maxGen: 5 })).toEqual([item])
    expect(ensureSpeciesIndex({ maxGen: 4 })).toBeNull()
  })
})
