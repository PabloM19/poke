import type { GameSession } from '@/features/gameSessions/model'

export const TYPE_GUESS_TOTAL_ROUNDS = 10

export type TypeGuessResult = 'correct' | 'partial' | 'incorrect'

export interface TypeGuessStat {
  name: string
  value: number
}

export interface TypeGuessPokemonSnapshot {
  id: number
  name: string
  sprite: string | null
  actualTypes: readonly string[]
  regionalNumber: number
  height: number | null
  weight: number | null
  totalBaseStats: number
  standoutStat: TypeGuessStat | null
}

export type TypeGuessPokemonRecord = Pick<
  TypeGuessPokemonSnapshot,
  'id' | 'name' | 'sprite' | 'actualTypes' | 'regionalNumber'
>

export interface TypeGuessRound {
  index: number
  pokemon: TypeGuessPokemonRecord
  selectedTypes: readonly string[]
  result: TypeGuessResult
  hintUsed: boolean
  answeredAt: number
}

export interface TypeGuessSession extends GameSession<TypeGuessRound, 'type-guess'> {
  totalRounds: typeof TYPE_GUESS_TOTAL_ROUNDS
  partialAnswers: number
  withoutDetails: number
}
