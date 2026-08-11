import type { GameSession } from '@/features/gameSessions'

export const POKEMON_SILHOUETTE_TOTAL_ROUNDS = 10
export const POKEMON_SILHOUETTE_MAX_ERRORS = 6

export interface PokemonSilhouetteSnapshot {
  id: number
  name: string
  sprite: string | null
  types: readonly string[]
  regionalNumber: number
  generationId: number
}

export type PokemonSilhouetteHint =
  | { kind: 'letter'; label: 'Letra revelada'; value: string; letter: string }
  | { kind: 'type'; label: 'Tipo primario' | 'Tipo secundario'; value: string; type: string }
  | { kind: 'number-range'; label: 'Número regional'; value: string }
  | { kind: 'generation'; label: 'Generación'; value: string }

export type PokemonSilhouetteRoundResult = 'solved' | 'failed'

export interface PokemonSilhouetteRound {
  index: number
  pokemon: PokemonSilhouetteSnapshot
  selectedLetters: readonly string[]
  incorrectLetters: readonly string[]
  fullGuesses: readonly string[]
  errors: number
  hints: readonly PokemonSilhouetteHint[]
  result: PokemonSilhouetteRoundResult
  points: number
}

export interface PokemonSilhouetteSession extends GameSession<PokemonSilhouetteRound, 'pokemon-silhouette'> {
  totalRounds: typeof POKEMON_SILHOUETTE_TOTAL_ROUNDS
  points: number
  perfectRounds: number
}

