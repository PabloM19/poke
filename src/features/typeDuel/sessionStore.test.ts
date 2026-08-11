import { describe, expect, it } from 'vitest'
import { getStored, setStored } from '@/lib/storage'
import type { TypeDuelRound, TypeDuelSession } from './model'
import {
  getTypeDuelSession,
  getTypeDuelSessions,
  nextTypeDuelAttemptName,
  renameTypeDuelSession,
  saveTypeDuelSession,
  TYPE_DUEL_STORAGE_KEY,
} from './sessionStore'

function round(index: number, isCorrect = true): TypeDuelRound {
  return {
    index,
    left: { id: 25, name: 'Pikachu', sprite: null, types: ['electric'] },
    right: { id: 130, name: 'Gyarados', sprite: null, types: ['water', 'flying'] },
    leftBest: { attackingType: 'electric', multiplier: 4 },
    rightBest: { attackingType: 'water', multiplier: 1 },
    correctAnswer: 'left',
    userAnswer: isCorrect ? 'left' : 'right',
    isCorrect,
  }
}

function session(id: string, finishedAt: number): TypeDuelSession {
  const rounds = Array.from({ length: 10 }, (_, index) => round(index + 1, index !== 9))
  return {
    id,
    gameType: 'type-duel',
    name: '',
    activeGameId: 'platino',
    gameTitle: 'Pokémon Platino',
    pokedexLabel: 'Pokédex regional de Sinnoh',
    generation: 4,
    mode: 'learn',
    startedAt: finishedAt - 60_000,
    finishedAt,
    score: 9,
    bestStreak: 9,
    totalRounds: 10,
    rounds,
  }
}

describe('historial de Duelo de tipos', () => {
  it('genera nombres consecutivos, persiste sesiones y conserva todas las rondas', () => {
    const first = saveTypeDuelSession(session('one', 1000))
    const second = saveTypeDuelSession(session('two', 2000))

    expect(first?.name).toBe('Intento 1')
    expect(second?.name).toBe('Intento 2')
    expect(nextTypeDuelAttemptName()).toBe('Intento 3')
    expect(getTypeDuelSessions().map((entry) => entry.id)).toEqual(['two', 'one'])
    expect(getTypeDuelSession('one')?.rounds).toHaveLength(10)
    expect(getStored(TYPE_DUEL_STORAGE_KEY)).toMatchObject({ version: 1 })
  })

  it('acepta un nombre personalizado y permite renombrar un intento guardado', () => {
    const saved = saveTypeDuelSession(session('custom', 3000), '  Repaso de Sinnoh  ')
    expect(saved?.name).toBe('Repaso de Sinnoh')

    const renamed = renameTypeDuelSession('custom', 'Racha eléctrica')
    expect(renamed?.name).toBe('Racha eléctrica')
    expect(getTypeDuelSession('custom')?.name).toBe('Racha eléctrica')
    expect(nextTypeDuelAttemptName()).toBe('Intento 2')
  })

  it('descarta un payload incompatible', () => {
    setStored(TYPE_DUEL_STORAGE_KEY, { version: 99, sessions: [session('bad', 1000)] })
    expect(getTypeDuelSessions()).toEqual([])
    expect(getStored(TYPE_DUEL_STORAGE_KEY)).toBeNull()
  })
})
