import { describe, expect, it } from 'vitest'
import { getMainGameContext } from '@/features/games/gameCatalog'
import { normalizeEncounters, normalizeEvolutionChain, normalizePokemonGameMoves, normalizeRegionalPokedex } from './gameDataNormalizers'
import { selectEncountersForGame, selectEvolutionForGame, selectMovesForGame } from './gameDataServices'

const ref = (name: string, kind = name) => ({ name, url: `https://pokeapi.co/api/v2/${kind}/1/` })

describe('datos dinámicos por juego', () => {
  const pearl = getMainGameContext('perla')

  it('normaliza la Pokédex regional sin perder el número local', () => {
    expect(normalizeRegionalPokedex({
      id: 5,
      name: 'original-sinnoh',
      pokemon_entries: [{ entry_number: 1, pokemon_species: ref('turtwig', 'pokemon-species') }],
    }, '/pokedex/original-sinnoh')).toMatchObject({
      name: 'original-sinnoh',
      entries: [{ entryNumber: 1, species: { name: 'turtwig' } }],
    })
  })

  it('conserva únicamente el learnset de Diamante y Perla', () => {
    const moves = normalizePokemonGameMoves({ moves: [{
      move: ref('pound', 'move'),
      version_group_details: [
        { level_learned_at: 1, move_learn_method: ref('level-up', 'move-learn-method'), version_group: ref('diamond-pearl', 'version-group') },
        { level_learned_at: 5, move_learn_method: ref('level-up', 'move-learn-method'), version_group: ref('platinum', 'version-group') },
      ],
    }] }, '/pokemon/393')

    expect(selectMovesForGame(moves, pearl)).toMatchObject([{ details: [{ level: 1, versionGroup: { name: 'diamond-pearl' } }] }])
  })

  it('conserva únicamente los encuentros de Perla', () => {
    const detail = { chance: 20, min_level: 4, max_level: 4, method: ref('walk', 'encounter-method'), condition_values: [] }
    const encounters = normalizeEncounters([{
      location_area: ref('sinnoh-route-201-area', 'location-area'),
      version_details: [
        { version: ref('pearl', 'version'), max_chance: 20, encounter_details: [detail] },
        { version: ref('platinum', 'version'), max_chance: 30, encounter_details: [detail] },
      ],
    }], '/pokemon/396/encounters')

    expect(selectEncountersForGame(encounters, pearl)[0].versions.map((entry) => entry.version.name)).toEqual(['pearl'])
  })

  it('elimina ramas evolutivas que no existen en el grupo de Perla', () => {
    const evolutionDetail = (versionGroup: string, minLevel: number) => ({
      trigger: ref('level-up', 'evolution-trigger'), version_group: ref(versionGroup, 'version-group'),
      min_level: minLevel, min_happiness: null, min_beauty: null, time_of_day: '',
      item: null, held_item: null, known_move: null, location: null,
    })
    const chain = normalizeEvolutionChain({
      id: 206,
      chain: {
        species: ref('starly', 'pokemon-species'), evolution_details: [],
        evolves_to: [
          { species: ref('staravia', 'pokemon-species'), evolution_details: [evolutionDetail('diamond-pearl', 14)], evolves_to: [] },
          { species: ref('future-form', 'pokemon-species'), evolution_details: [evolutionDetail('x-y', 20)], evolves_to: [] },
        ],
      },
    }, '/evolution-chain/206')

    expect(selectEvolutionForGame(chain, pearl).chain.evolvesTo.map((node) => node.species.name)).toEqual(['staravia'])
    expect(selectEvolutionForGame(chain, getMainGameContext('platino')).chain.evolvesTo.map((node) => node.species.name)).toEqual(['staravia'])
  })

  it('rechaza contratos incompletos en vez de mostrar datos dudosos', () => {
    expect(() => normalizeRegionalPokedex({ name: 'original-sinnoh', pokemon_entries: [] }, '/pokedex/original-sinnoh')).toThrow('pokedex.id')
  })
})
