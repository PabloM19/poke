import type { GameSession } from '@/features/gameSessions/model'

export const EVOLUTION_CHAIN_TOTAL_ROUNDS = 10

export interface EvolutionPokemonSnapshot {
  id: number
  name: string
  sprite: string | null
}

export interface EvolutionStageSnapshot extends EvolutionPokemonSnapshot {
  /** Método para llegar a esta fase desde la anterior. La fase inicial usa null. */
  method: string | null
}

export interface EvolutionFamilySnapshot {
  chainId: number
  stages: readonly EvolutionStageSnapshot[]
}

export interface GeneratedEvolutionRound {
  family: EvolutionFamilySnapshot
  presentedOrder: readonly number[]
}

export interface EvolutionChainRound {
  index: number
  chainId: number
  pokemon: readonly EvolutionStageSnapshot[]
  presentedOrder: readonly number[]
  selectedOrder: readonly number[]
  correctOrder: readonly number[]
  correct: boolean
}

export interface EvolutionChainSession extends GameSession<EvolutionChainRound, 'evolution-chain'> {
  totalRounds: typeof EVOLUTION_CHAIN_TOTAL_ROUNDS
}
