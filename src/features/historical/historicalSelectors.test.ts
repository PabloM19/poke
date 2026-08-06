import { describe, expect, it } from 'vitest'
import type { NamedAPIResource, Pokemon, Type, TypeRelations } from '@/lib/pokeapi'
import {
  getGenerationResourceId,
  selectPokemonStatsForGeneration,
  selectPokemonTypesForGeneration,
  selectTypeRelationsForGeneration,
} from './historicalSelectors'

const resource = (name: string, kind = 'type', id = 1): NamedAPIResource => ({
  name,
  url: `https://pokeapi.co/api/v2/${kind}/${id}/`,
})
const pokemonType = (name: string, slot = 1) => ({ slot, type: resource(name) })
const stat = (name: string, value: number, id = 1) => ({
  base_stat: value,
  stat: resource(name, 'stat', id),
})
const generation = (id: number): NamedAPIResource => resource(`generation-${['i', 'ii', 'iii', 'iv', 'v', 'vi'][id - 1]}`, 'generation', id)
const relations = (halfDamageFrom: string[] = []): TypeRelations => ({
  double_damage_to: [], half_damage_to: [], no_damage_to: [],
  double_damage_from: [], no_damage_from: [],
  half_damage_from: halfDamageFrom.map((name) => resource(name)),
})

const pikachu: Pokemon = {
  id: 25,
  name: 'pikachu',
  sprites: { front_default: null },
  types: [pokemonType('electric')],
  past_types: [],
  stats: [
    stat('hp', 35, 1), stat('attack', 55, 2), stat('defense', 40, 3),
    stat('special-attack', 50, 4), stat('special-defense', 50, 5), stat('speed', 90, 6),
  ],
  past_stats: [
    { generation: generation(1), stats: [stat('special', 50, 9)] },
    { generation: generation(5), stats: [stat('defense', 30, 3), stat('special-defense', 40, 5)] },
  ],
}

describe('historical selectors', () => {
  it('lee el id de generación desde URL y usa el nombre como fallback', () => {
    expect(getGenerationResourceId(generation(5))).toBe(5)
    expect(getGenerationResourceId({ name: 'generation-iv', url: '' })).toBe(4)
    expect(getGenerationResourceId({ name: 'unknown', url: '' })).toBeNull()
  })

  it('elige el snapshot de tipos cuyo límite incluye la generación', () => {
    const pokemon: Pokemon = {
      ...pikachu,
      types: [pokemonType('fairy')],
      past_types: [
        { generation: generation(2), types: [pokemonType('normal')] },
        { generation: generation(5), types: [pokemonType('psychic')] },
      ],
    }

    expect(selectPokemonTypesForGeneration(pokemon, 1).map((entry) => entry.type.name)).toEqual(['normal'])
    expect(selectPokemonTypesForGeneration(pokemon, 4).map((entry) => entry.type.name)).toEqual(['psychic'])
    expect(selectPokemonTypesForGeneration(pokemon, 5).map((entry) => entry.type.name)).toEqual(['psychic'])
  })

  it('compone stats parciales y sustituye el par especial en Gen I', () => {
    const genOne = selectPokemonStatsForGeneration(pikachu, 1)
    const genFive = selectPokemonStatsForGeneration(pikachu, 5)

    expect(genOne.map((entry) => [entry.stat.name, entry.base_stat])).toEqual([
      ['hp', 35], ['attack', 55], ['defense', 30], ['special', 50], ['speed', 90],
    ])
    expect(genFive.find((entry) => entry.stat.name === 'defense')?.base_stat).toBe(30)
    expect(genFive.find((entry) => entry.stat.name === 'special-defense')?.base_stat).toBe(40)
  })

  it('elige relaciones históricas sin mutar el recurso actual', () => {
    const steel: Type = {
      id: 9,
      name: 'steel',
      damage_relations: relations(['normal']),
      past_damage_relations: [{
        generation: generation(5),
        damage_relations: relations(['ghost', 'dark']),
      }],
    }

    const oldRelations = selectTypeRelationsForGeneration(steel, 5)
    expect(oldRelations.half_damage_from.map((entry) => entry.name)).toEqual(['ghost', 'dark'])
    expect(selectTypeRelationsForGeneration(steel, 5)).not.toBe(steel.past_damage_relations[0].damage_relations)
    expect(steel.damage_relations.half_damage_from.map((entry) => entry.name)).toEqual(['normal'])
  })
})
