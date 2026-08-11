import type { DamageMultiplier } from '@/features/historical'
import type { GameSession } from '@/features/gameSessions/model'

export const TYPE_DUEL_TOTAL_ROUNDS = 10

export type TypeDuelMode = 'learn' | 'normal'
export type TypeDuelAnswer = 'left' | 'neutral' | 'right'

export interface TypeDuelPokemonSnapshot {
  id: number
  name: string
  sprite: string | null
  types: readonly string[]
}

export interface TypeDuelAttackResult {
  attackingType: string
  multiplier: DamageMultiplier
}

export interface TypeDuelRound {
  index: number
  left: TypeDuelPokemonSnapshot
  right: TypeDuelPokemonSnapshot
  leftBest: TypeDuelAttackResult
  rightBest: TypeDuelAttackResult
  correctAnswer: TypeDuelAnswer
  userAnswer: TypeDuelAnswer
  isCorrect: boolean
}

export interface TypeDuelSession extends GameSession<TypeDuelRound, 'type-duel'> {
  mode: TypeDuelMode
  totalRounds: typeof TYPE_DUEL_TOTAL_ROUNDS
}

export interface GeneratedTypeDuelRound {
  left: TypeDuelPokemonSnapshot
  right: TypeDuelPokemonSnapshot
  leftBest: TypeDuelAttackResult
  rightBest: TypeDuelAttackResult
  correctAnswer: TypeDuelAnswer
}
