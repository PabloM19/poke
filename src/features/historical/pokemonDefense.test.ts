import { describe, expect, it } from 'vitest'
import type { NamedAPIResource, Pokemon, Type, TypeRelations } from '@/lib/pokeapi'
import { getTypeNamesForGeneration, resolvePokemonDefenseForGame } from './pokemonDefense'

const resource = (name: string, kind = 'type', id = 1): NamedAPIResource => ({
  name,
  url: `https://pokeapi.co/api/v2/${kind}/${id}/`,
})
const generation = (id: number) => resource(`generation-${['i', 'ii', 'iii', 'iv', 'v'][id - 1]}`, 'generation', id)
const relations = ({ half = [], double = [], none = [] }: {
  half?: string[]; double?: string[]; none?: string[]
} = {}): TypeRelations => ({
  half_damage_from: half.map((name) => resource(name)),
  double_damage_from: double.map((name) => resource(name)),
  no_damage_from: none.map((name) => resource(name)),
  half_damage_to: [], double_damage_to: [], no_damage_to: [],
})
const pokemon: Pokemon = {
  id: 35,
  name: 'clefairy',
  sprites: { front_default: null },
  types: [{ slot: 1, type: resource('fairy') }],
  past_types: [{
    generation: generation(5),
    types: [{ slot: 1, type: resource('normal') }],
  }],
  stats: [],
  past_stats: [],
}

function type(name: string, current: TypeRelations, past?: TypeRelations): Type {
  return {
    id: 1,
    name,
    damage_relations: current,
    past_damage_relations: past ? [{ generation: generation(5), damage_relations: past }] : [],
  }
}

describe('pokemon defense for game', () => {
  it('expone solo tipos existentes en la generación', () => {
    expect(getTypeNamesForGeneration(1)).not.toContain('steel')
    expect(getTypeNamesForGeneration(4)).toContain('steel')
    expect(getTypeNamesForGeneration(5)).not.toContain('fairy')
  })

  it('resuelve el tipo histórico del Pokémon para el juego', () => {
    const result = resolvePokemonDefenseForGame(
      pokemon,
      new Map([['normal', type('normal', relations())]]),
      { id: 'negro', generation: 5 }
    )

    expect(result).toMatchObject({
      gameId: 'negro',
      generation: 5,
      defendingTypes: ['normal'],
    })
    expect(result.matchups.some((entry) => entry.attackingType === 'fairy')).toBe(false)
  })

  it('usa las relaciones antiguas de Acero en Generación V', () => {
    const steelPokemon: Pokemon = {
      ...pokemon,
      id: 483,
      name: 'dialga',
      types: [{ slot: 1, type: resource('steel') }],
      past_types: [],
    }
    const steel = type('steel', relations(), relations({ half: ['ghost', 'dark'] }))
    const result = resolvePokemonDefenseForGame(
      steelPokemon,
      new Map([['steel', steel]]),
      { id: 'negro-2', generation: 5 }
    )

    expect(result.matchups.find((entry) => entry.attackingType === 'ghost')?.multiplier).toBe(0.5)
    expect(result.matchups.find((entry) => entry.attackingType === 'dark')?.multiplier).toBe(0.5)
  })

  it('falla de forma explícita si falta un recurso de tipo', () => {
    expect(() => resolvePokemonDefenseForGame(
      pokemon,
      new Map(),
      { id: 'perla', generation: 4 }
    )).toThrow(/Faltan datos PokeAPI para el tipo normal/)
  })
})
