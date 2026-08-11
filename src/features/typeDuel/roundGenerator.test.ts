import { describe, expect, it, vi } from 'vitest'
import type { Pokemon } from '@/lib/pokeapi'
import type { PokemonSummaryItem } from '@/features/pokedex/summary'
import { generateTypeDuelRound, resolveDuelPokemon } from './roundGenerator'

function summary(id: number, name: string, types: string[]): PokemonSummaryItem {
  return {
    id,
    name: name.toLowerCase(),
    nameEs: name,
    generationId: 1,
    types,
    sprite: `https://example.test/${id}.png`,
    stats: { hp: 1, attack: 1, defense: 1, specialAttack: 1, specialDefense: 1, speed: 1 },
    total: 6,
  }
}

function pokemon(id: number, currentType: string, historicalType?: string): Pokemon {
  return {
    id,
    name: `pokemon-${id}`,
    sprites: { front_default: `https://example.test/${id}.png` },
    types: [{ slot: 1, type: { name: currentType, url: '' } }],
    past_types: historicalType ? [{
      generation: { name: 'generation-v', url: 'https://pokeapi.co/api/v2/generation/5/' },
      types: [{ slot: 1, type: { name: historicalType, url: '' } }],
    }] : [],
    stats: [],
    past_stats: [],
  }
}

describe('generador de rondas de Duelo de tipos', () => {
  it('resuelve los tipos históricos del juego en vez de usar el tipo actual', async () => {
    const loadPokemon = vi.fn().mockResolvedValue(pokemon(35, 'fairy', 'normal'))
    const resolved = await resolveDuelPokemon(summary(35, 'Clefairy', ['fairy']), 4, loadPokemon)

    expect(resolved.types).toEqual(['normal'])
    expect(loadPokemon).toHaveBeenCalledWith(35, { signal: undefined })
  })

  it('excluye Pokémon ya utilizados durante la sesión', async () => {
    const items = [
      summary(25, 'Pikachu', ['electric']),
      summary(50, 'Diglett', ['ground']),
      summary(7, 'Squirtle', ['water']),
    ]
    const byId = new Map([
      [25, pokemon(25, 'electric')],
      [50, pokemon(50, 'ground')],
      [7, pokemon(7, 'water')],
    ])
    const loadPokemon = vi.fn((id: number) => Promise.resolve(byId.get(id)!))

    const round = await generateTypeDuelRound({
      items,
      generation: 4,
      mode: 'normal',
      excludedIds: new Set([25]),
      random: () => 0,
      loadPokemon,
    })

    expect(new Set([round.left.id, round.right.id])).toEqual(new Set([50, 7]))
    expect(round.left.id).not.toBe(round.right.id)
  })

  it('preselecciona localmente un cruce claro en Aprender y solo carga la pareja elegida', async () => {
    const items = [
      summary(1, 'Bulbasaur', ['grass']),
      summary(4, 'Charmander', ['fire']),
      summary(7, 'Squirtle', ['water']),
      summary(25, 'Pikachu', ['electric']),
    ]
    const byId = new Map([
      [1, pokemon(1, 'grass')],
      [4, pokemon(4, 'fire')],
      [7, pokemon(7, 'water')],
      [25, pokemon(25, 'electric')],
    ])
    const loadPokemon = vi.fn((id: number) => Promise.resolve(byId.get(id)!))

    const round = await generateTypeDuelRound({
      items,
      generation: 4,
      mode: 'learn',
      random: () => 0.99,
      loadPokemon,
    })

    expect(round.correctAnswer).not.toBe('neutral')
    expect(loadPokemon).toHaveBeenCalledTimes(2)
  })
})
