import { describe, expect, it } from 'vitest'
import type { NamedAPIResource, TypeRelations } from '@/lib/pokeapi'
import { buildDefensiveTypeMatrix } from './typeMatrix'

const resource = (name: string): NamedAPIResource => ({ name, url: `https://pokeapi.co/api/v2/type/${name}/` })
const relations = ({
  double = [], half = [], none = [],
}: { double?: string[]; half?: string[]; none?: string[] } = {}): TypeRelations => ({
  double_damage_from: double.map(resource),
  half_damage_from: half.map(resource),
  no_damage_from: none.map(resource),
  double_damage_to: [], half_damage_to: [], no_damage_to: [],
})

describe('defensive type matrix', () => {
  const byType = new Map<string, TypeRelations>([
    ['fire', relations({ double: ['water', 'ground', 'rock'], half: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'] })],
    ['flying', relations({ double: ['electric', 'ice', 'rock'], half: ['grass', 'fighting', 'bug'], none: ['ground'] })],
  ])
  const attackingTypes = ['normal', 'water', 'ground', 'rock', 'grass', 'fighting', 'electric']

  it('produce neutro, resistencia, doble resistencia, debilidad e inmunidad', () => {
    const matrix = buildDefensiveTypeMatrix(['fire', 'flying'], byType, attackingTypes)
    expect(Object.fromEntries(matrix.map((entry) => [entry.attackingType, entry.multiplier]))).toEqual({
      normal: 1,
      water: 2,
      ground: 0,
      rock: 4,
      grass: 0.25,
      fighting: 0.5,
      electric: 2,
    })
  })

  it('hace que una inmunidad domine aunque el otro tipo sea débil', () => {
    const matrix = buildDefensiveTypeMatrix(['fire', 'flying'], byType, ['ground'])
    expect(matrix).toEqual([{ attackingType: 'ground', multiplier: 0 }])
  })

  it('no muta entradas, elimina ataques duplicados y valida datos incompletos', () => {
    const attacks = ['rock', 'rock']
    expect(buildDefensiveTypeMatrix(['fire'], byType, attacks)).toEqual([
      { attackingType: 'rock', multiplier: 2 },
    ])
    expect(attacks).toEqual(['rock', 'rock'])
    expect(() => buildDefensiveTypeMatrix([], byType, attacks)).toThrow(/uno o dos tipos/)
    expect(() => buildDefensiveTypeMatrix(['ghost'], byType, attacks)).toThrow(/Faltan relaciones/)
  })
})
