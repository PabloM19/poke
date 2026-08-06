import type { GenId, Pokemon, Type } from '@/lib/pokeapi'
import {
  selectPokemonTypesForGeneration,
  selectTypeRelationsForGeneration,
} from './historicalSelectors'
import {
  buildDefensiveTypeMatrix,
  type DefensiveMatchup,
} from './typeMatrix'

const GENERATION_ONE_TYPES = [
  'normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost',
  'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon',
] as const
const GENERATION_TWO_TO_FIVE_TYPES = [
  ...GENERATION_ONE_TYPES,
  'dark',
  'steel',
] as const

export interface BattleGameSelection {
  id: string
  generation: GenId
}

export interface ResolvedPokemonDefense {
  gameId: string
  generation: GenId
  defendingTypes: string[]
  matchups: DefensiveMatchup[]
}

export function getTypeNamesForGeneration(generation: GenId): string[] {
  return generation === 1
    ? [...GENERATION_ONE_TYPES]
    : [...GENERATION_TWO_TO_FIVE_TYPES]
}

export function resolvePokemonDefenseForGame(
  pokemon: Pokemon,
  typesByName: ReadonlyMap<string, Type>,
  game: BattleGameSelection
): ResolvedPokemonDefense {
  const defendingTypes = selectPokemonTypesForGeneration(pokemon, game.generation)
    .map((entry) => entry.type.name)
  const relationsByType = new Map(defendingTypes.map((typeName) => {
    const type = typesByName.get(typeName)
    if (type == null) throw new Error(`Faltan datos PokeAPI para el tipo ${typeName}`)
    return [typeName, selectTypeRelationsForGeneration(type, game.generation)]
  }))

  return {
    gameId: game.id,
    generation: game.generation,
    defendingTypes,
    matchups: buildDefensiveTypeMatrix(
      defendingTypes,
      relationsByType,
      getTypeNamesForGeneration(game.generation)
    ),
  }
}
