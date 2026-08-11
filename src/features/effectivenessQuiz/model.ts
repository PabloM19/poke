import type { GameSession } from '@/features/gameSessions/model'

export const EFFECTIVENESS_TOTAL_ROUNDS = 10

export type EffectivenessMultiplier = 0 | 0.5 | 1 | 2
export type EffectivenessAnswer = 'super-effective' | 'normal' | 'not-very-effective' | 'no-effect'

export interface GeneratedEffectivenessQuestion {
  attackingType: string
  defendingType: string
  multiplier: EffectivenessMultiplier
}

export interface EffectivenessRound extends GeneratedEffectivenessQuestion {
  index: number
  selectedAnswer: EffectivenessAnswer
  correct: boolean
}

export interface EffectivenessSession extends GameSession<EffectivenessRound, 'type-effectiveness'> {
  totalRounds: typeof EFFECTIVENESS_TOTAL_ROUNDS
}
