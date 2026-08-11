import { describe, expect, it } from 'vitest'
import { GAME_SESSIONS_STORAGE_KEY } from '@/features/gameSessions'
import { getStored } from '@/lib/storage'
import type { EffectivenessRound, EffectivenessSession } from './model'
import { getEffectivenessSession, getEffectivenessSessions, renameEffectivenessSession, saveEffectivenessSession } from './sessionStore'

function round(index: number): EffectivenessRound {
  return { index, attackingType: 'fire', defendingType: 'grass', multiplier: 2, selectedAnswer: index === 1 ? 'normal' : 'super-effective', correct: index !== 1 }
}

function session(): EffectivenessSession {
  return {
    id: 'effectiveness-session', gameType: 'type-effectiveness', name: '', activeGameId: 'platino',
    gameTitle: 'Pokémon Platino', pokedexLabel: 'Tabla de tipos · Generación IV', generation: 4,
    startedAt: 1_000, finishedAt: 2_000, score: 9, bestStreak: 9, totalRounds: 10,
    rounds: Array.from({ length: 10 }, (_, index) => round(index + 1)),
  }
}

describe('sesiones de ¿Es eficaz?', () => {
  it('persiste en GameSession, recupera rondas y permite renombrar', () => {
    expect(saveEffectivenessSession(session())?.name).toBe('Intento 1')
    expect(getEffectivenessSessions()).toHaveLength(1)
    expect(getEffectivenessSession('effectiveness-session')?.rounds).toHaveLength(10)
    expect(renameEffectivenessSession('effectiveness-session', 'Repaso de eficacia')?.name).toBe('Repaso de eficacia')
    expect(getStored(GAME_SESSIONS_STORAGE_KEY)).toMatchObject({ version: 1 })
  })
})
