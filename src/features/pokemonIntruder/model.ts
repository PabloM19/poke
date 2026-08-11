import type { GameSession } from '@/features/gameSessions/model'

export const POKEMON_INTRUDER_TOTAL_ROUNDS = 10

export interface SharedTypeCriterion {
  kind: 'shared-type'
  type: string
}

export type PokemonIntruderCriterion = SharedTypeCriterion

export interface IntruderPokemonSnapshot {
  id: number
  name: string
  sprite: string | null
  types: readonly string[]
}

export interface GeneratedIntruderRound {
  criterion: PokemonIntruderCriterion
  pokemon: readonly IntruderPokemonSnapshot[]
  intruderId: number
}

export interface PokemonIntruderRound extends GeneratedIntruderRound {
  index: number
  selectedId: number
  correct: boolean
}

export interface PokemonIntruderSession extends GameSession<PokemonIntruderRound, 'pokemon-intruder'> {
  totalRounds: typeof POKEMON_INTRUDER_TOTAL_ROUNDS
}
