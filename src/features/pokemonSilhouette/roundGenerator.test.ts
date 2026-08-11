import { describe, expect, it } from 'vitest'
import type { Pokemon } from '@/lib/pokeapi'
import { generatePokemonSilhouette } from './roundGenerator'

const item = {
  id: 25, name: 'pikachu', nameEs: 'Pikachu', generationId: 1, types: ['electric'],
  stats: { hp: 35, attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90 },
  total: 320, sprite: 'summary.png',
}

describe('generador de siluetas', () => {
  it('carga artwork, tipos históricos y número regional sin guardar el objeto completo', async () => {
    const pokemon = {
      id: 25, name: 'pikachu', stats: [], past_stats: [], past_types: [],
      types: [{ slot: 1, type: { name: 'electric', url: '' } }],
      sprites: { front_default: 'front.png', official_artwork: 'art.png' },
    } as Pokemon
    const result = await generatePokemonSilhouette({
      items: [item], entryNumbers: new Map([[25, 104]]), generation: 4,
      loadPokemon: async () => pokemon,
    })
    expect(result).toEqual({ id: 25, name: 'Pikachu', sprite: 'art.png', types: ['electric'], regionalNumber: 104, generationId: 1 })
  })

  it('evita IDs usados mientras queden alternativas', async () => {
    const second = { ...item, id: 26, name: 'raichu', nameEs: 'Raichu' }
    const pokemon = {
      id: 26, name: 'raichu', stats: [], past_stats: [], past_types: [],
      types: [{ slot: 1, type: { name: 'electric', url: '' } }],
      sprites: { front_default: 'raichu.png', official_artwork: null },
    } as Pokemon
    const result = await generatePokemonSilhouette({
      items: [item, second], entryNumbers: new Map(), generation: 4, excludedIds: new Set([25]), loadPokemon: async () => pokemon, random: () => 0,
    })
    expect(result.id).toBe(26)
  })
})
