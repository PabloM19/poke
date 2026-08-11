import { describe, expect, it } from 'vitest'
import type { Pokemon } from '@/lib/pokeapi'
import { generateTypeGuessPokemon } from './roundGenerator'

const item = {
  id: 130, name: 'gyarados', nameEs: 'Gyarados', generationId: 1, types: ['water', 'flying'],
  stats: { hp: 95, attack: 125, defense: 79, specialAttack: 60, specialDefense: 100, speed: 81 },
  total: 540, sprite: 'summary.png',
}

describe('generador de Adivina el tipo', () => {
  it('obtiene arte y datos neutrales mínimos respetando tipos históricos', async () => {
    const pokemon = {
      id: 130, name: 'gyarados', height: 65, weight: 2350, past_types: [], past_stats: [],
      types: [{ slot: 1, type: { name: 'water', url: '' } }, { slot: 2, type: { name: 'flying', url: '' } }],
      stats: [
        { base_stat: 95, stat: { name: 'hp', url: '' } },
        { base_stat: 125, stat: { name: 'attack', url: '' } },
      ],
      sprites: { front_default: 'front.png', official_artwork: 'art.png' },
    } as Pokemon
    const result = await generateTypeGuessPokemon({ items: [item], entryNumbers: new Map([[130, 24]]), generation: 4, loadPokemon: async () => pokemon })
    expect(result).toMatchObject({ name: 'Gyarados', sprite: 'art.png', actualTypes: ['water', 'flying'], regionalNumber: 24, height: 65, weight: 2350, totalBaseStats: 220, standoutStat: { name: 'attack', value: 125 } })
  })

  it('usa el sprite normal si no existe artwork y tolera datos neutrales ausentes', async () => {
    const pokemon = {
      id: 130, name: 'gyarados', past_types: [], past_stats: [],
      types: [{ slot: 1, type: { name: 'water', url: '' } }, { slot: 2, type: { name: 'flying', url: '' } }],
      stats: [], sprites: { front_default: 'front.png', official_artwork: null },
    } as Pokemon
    const result = await generateTypeGuessPokemon({ items: [item], entryNumbers: new Map(), generation: 4, loadPokemon: async () => pokemon })
    expect(result).toMatchObject({ sprite: 'front.png', height: null, weight: null, totalBaseStats: 0, standoutStat: null })
  })
})
