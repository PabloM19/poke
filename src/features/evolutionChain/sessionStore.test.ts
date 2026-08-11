import { describe, expect, it } from 'vitest'
import { GAME_SESSIONS_STORAGE_KEY } from '@/features/gameSessions'
import { getStored } from '@/lib/storage'
import type { EvolutionChainRound, EvolutionChainSession } from './model'
import { getEvolutionChainSession, getEvolutionChainSessions, renameEvolutionChainSession, saveEvolutionChainSession } from './sessionStore'

const pokemon = [
  { id: 1, name: 'Bulbasaur', sprite: '1.png', method: null },
  { id: 2, name: 'Ivysaur', sprite: '2.png', method: 'Nivel 16' },
  { id: 3, name: 'Venusaur', sprite: '3.png', method: 'Nivel 32' },
]

function round(index: number): EvolutionChainRound {
  return { index, chainId: index, pokemon, presentedOrder: [3, 1, 2], selectedOrder: index === 1 ? [2, 1, 3] : [1, 2, 3], correctOrder: [1, 2, 3], correct: index !== 1 }
}

function session(): EvolutionChainSession {
  return {
    id: 'evolution-session', gameType: 'evolution-chain', name: '', activeGameId: 'platino', gameTitle: 'Pokémon Platino',
    pokedexLabel: 'Pokédex regional de Sinnoh', generation: 4, startedAt: 1_000, finishedAt: 2_000,
    score: 9, bestStreak: 9, totalRounds: 10, rounds: Array.from({ length: 10 }, (_, index) => round(index + 1)),
  }
}

describe('sesiones de Cadena evolutiva', () => {
  it('persiste rondas compactas, recupera y renombra', () => {
    expect(saveEvolutionChainSession(session())?.name).toBe('Intento 1')
    expect(getEvolutionChainSessions()).toHaveLength(1)
    expect(getEvolutionChainSession('evolution-session')?.rounds[0].chainId).toBe(1)
    expect(renameEvolutionChainSession('evolution-session', 'Familias de Sinnoh')?.name).toBe('Familias de Sinnoh')
    expect(getStored(GAME_SESSIONS_STORAGE_KEY)).toMatchObject({ version: 1 })
  })
})
