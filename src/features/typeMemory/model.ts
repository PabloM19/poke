import type { GameSession } from '@/features/gameSessions/model'
import type { PokemonTypeSlug } from '@/features/types'

export type TypeMemoryDifficulty = 'easy' | 'normal' | 'hard'
export type TypeMemoryCardKind = 'name' | 'symbol'

export const TYPE_MEMORY_DIFFICULTIES = {
  easy: { label: 'Fácil', pairCount: 4, description: '4 parejas · 8 cartas' },
  normal: { label: 'Normal', pairCount: 6, description: '6 parejas · 12 cartas' },
  hard: { label: 'Difícil', pairCount: 9, description: '9 parejas · 18 cartas' },
} as const satisfies Record<TypeMemoryDifficulty, { label: string; pairCount: 4 | 6 | 9; description: string }>

export interface TypeMemoryCard {
  id: string
  type: PokemonTypeSlug
  kind: TypeMemoryCardKind
}

/** One completed two-card attempt; enough to review the play without storing UI frames. */
export interface TypeMemoryTurn {
  index: number
  firstCardId: string
  secondCardId: string
  firstType: PokemonTypeSlug
  secondType: PokemonTypeSlug
  matched: boolean
}

export interface TypeMemorySession extends GameSession<TypeMemoryTurn, 'type-memory'> {
  difficulty: TypeMemoryDifficulty
  pairCount: 4 | 6 | 9
  attempts: number
  durationMs: number
  typesUsed: readonly PokemonTypeSlug[]
}
