import { describe, expect, it, vi } from 'vitest'
import type { PokemonSummaryItem } from '@/features/pokedex/summary'
import type { Pokemon } from '@/lib/pokeapi'
import { generateIntruderRound, hasUnambiguousIntruder } from './generator'
import type { IntruderPokemonSnapshot } from './model'

function item(id: number, name: string, types: string[]): PokemonSummaryItem {
  return { id, name: name.toLowerCase(), nameEs: name, generationId: 1, types, sprite: `${id}.png`, stats: { hp: 1, attack: 1, defense: 1, specialAttack: 1, specialDefense: 1, speed: 1 }, total: 6 }
}

function pokemon(id: number, name: string, types: string[]): Pokemon {
  return {
    id, name: name.toLowerCase(), sprites: { front_default: `${id}.png` }, stats: [], past_stats: [], past_types: [],
    types: types.map((type, index) => ({ slot: index + 1, type: { name: type, url: `/type/${type}` } })),
  }
}

const snapshots: IntruderPokemonSnapshot[] = [
  { id: 1, name: 'Bulbasaur', sprite: '1.png', types: ['grass', 'poison'] },
  { id: 43, name: 'Oddish', sprite: '43.png', types: ['grass', 'poison'] },
  { id: 69, name: 'Bellsprout', sprite: '69.png', types: ['grass', 'poison'] },
  { id: 4, name: 'Charmander', sprite: '4.png', types: ['fire'] },
]

describe('generador de Pokémon intruso', () => {
  it('acepta dobles tipos cuando los tres miembros comparten el objetivo', () => {
    expect(hasUnambiguousIntruder(snapshots, 'grass', 4)).toBe(true)
    expect(snapshots.slice(0, 3).every((entry) => entry.types.includes('grass'))).toBe(true)
    expect(snapshots[3].types).not.toContain('grass')
  })

  it('rechaza una combinación si otro patrón de tres señala a un intruso diferente', () => {
    const ambiguous: IntruderPokemonSnapshot[] = [
      { id: 1, name: 'A', sprite: null, types: ['grass', 'poison'] },
      { id: 2, name: 'B', sprite: null, types: ['grass', 'poison'] },
      { id: 3, name: 'C', sprite: null, types: ['grass', 'water'] },
      { id: 4, name: 'D', sprite: null, types: ['fire', 'poison'] },
    ]
    expect(hasUnambiguousIntruder(ambiguous, 'grass', 4)).toBe(false)
  })

  it('genera cuatro Pokémon, valida tipos históricos y equilibra la posición del intruso', async () => {
    const items = [item(1, 'Bulbasaur', ['grass', 'poison']), item(43, 'Oddish', ['grass', 'poison']), item(69, 'Bellsprout', ['grass', 'poison']), item(4, 'Charmander', ['fire'])]
    const byId = new Map([
      [1, pokemon(1, 'Bulbasaur', ['grass', 'poison'])], [43, pokemon(43, 'Oddish', ['grass', 'poison'])],
      [69, pokemon(69, 'Bellsprout', ['grass', 'poison'])], [4, pokemon(4, 'Charmander', ['fire'])],
    ])
    const loadPokemon = vi.fn(async (id: number) => byId.get(id) as Pokemon)
    const round = await generateIntruderRound({ items, generation: 4, excludedTypes: new Set(['poison']), intruderPositionCounts: [2, 0, 0, 0], random: () => 0, loadPokemon })
    expect(round.criterion).toEqual({ kind: 'shared-type', type: 'grass' })
    expect(round.pokemon).toHaveLength(4)
    expect(round.pokemon.findIndex((entry) => entry.id === round.intruderId)).toBe(1)
    expect(round.pokemon.find((entry) => entry.id === round.intruderId)?.types).not.toContain('grass')
    expect(loadPokemon).toHaveBeenCalledTimes(4)
  })
})
