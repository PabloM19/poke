import { describe, expect, it } from 'vitest'
import { GAME_SESSIONS_STORAGE_KEY } from '@/features/gameSessions'
import { getStored } from '@/lib/storage'
import type { TypeMemorySession } from './model'
import { getTypeMemorySession, getTypeMemorySessions, renameTypeMemorySession, saveTypeMemorySession } from './sessionStore'

function memorySession(): TypeMemorySession {
  return {
    id: 'memory-session', gameType: 'type-memory', name: '', activeGameId: 'platino', gameTitle: 'Pokémon Platino',
    pokedexLabel: 'Tabla de tipos · Generación IV', generation: 4, startedAt: 1_000, finishedAt: 75_000,
    score: 4, bestStreak: 2, totalRounds: 4, difficulty: 'easy', pairCount: 4, attempts: 5, durationMs: 74_000,
    typesUsed: ['fire', 'water', 'grass', 'electric'],
    rounds: [
      { index: 1, firstCardId: 'fire:name', secondCardId: 'water:symbol', firstType: 'fire', secondType: 'water', matched: false },
      { index: 2, firstCardId: 'fire:name', secondCardId: 'fire:symbol', firstType: 'fire', secondType: 'fire', matched: true },
      { index: 3, firstCardId: 'water:name', secondCardId: 'water:symbol', firstType: 'water', secondType: 'water', matched: true },
      { index: 4, firstCardId: 'grass:name', secondCardId: 'grass:symbol', firstType: 'grass', secondType: 'grass', matched: true },
      { index: 5, firstCardId: 'electric:name', secondCardId: 'electric:symbol', firstType: 'electric', secondType: 'electric', matched: true },
    ],
  }
}

describe('sesiones de Memoria de tipos', () => {
  it('persiste resumen, secuencia mínima y permite renombrar', () => {
    expect(saveTypeMemorySession(memorySession())?.name).toBe('Intento 1')
    expect(getTypeMemorySessions()).toHaveLength(1)
    expect(getTypeMemorySession('memory-session')).toMatchObject({ difficulty: 'easy', attempts: 5, durationMs: 74_000 })
    expect(getTypeMemorySession('memory-session')?.rounds[0]).toMatchObject({ firstType: 'fire', secondType: 'water', matched: false })
    expect(renameTypeMemorySession('memory-session', 'Símbolos básicos')?.name).toBe('Símbolos básicos')
    expect(getStored(GAME_SESSIONS_STORAGE_KEY)).toMatchObject({ version: 1 })
  })
})
