import { describe, expect, it } from 'vitest'
import { GAME_SESSIONS_STORAGE_KEY } from '@/features/gameSessions'
import { getStored } from '@/lib/storage'
import type { TypeGuessRound, TypeGuessSession } from './model'
import { getTypeGuessSession, getTypeGuessSessions, renameTypeGuessSession, saveTypeGuessSession } from './sessionStore'

function round(index: number): TypeGuessRound {
  return {
    index,
    pokemon: { id: 1, name: 'Bulbasaur', sprite: null, actualTypes: ['grass', 'poison'], regionalNumber: 1 },
    selectedTypes: index === 1 ? ['grass'] : ['grass', 'poison'],
    result: index === 1 ? 'partial' : 'correct',
    hintUsed: index === 1,
    answeredAt: 1_000 + index,
  }
}

function session(): TypeGuessSession {
  return {
    id: 'type-guess-session', gameType: 'type-guess', name: '', activeGameId: 'platino', gameTitle: 'Pokémon Platino',
    pokedexLabel: 'Pokédex regional de Sinnoh', generation: 4, startedAt: 1_000, finishedAt: 2_000,
    score: 9, bestStreak: 9, totalRounds: 10, partialAnswers: 1, withoutDetails: 9,
    rounds: Array.from({ length: 10 }, (_, index) => round(index + 1)),
  }
}

describe('sesiones de Adivina el tipo', () => {
  it('usa el almacenamiento compartido, recupera rondas y permite renombrar', () => {
    expect(saveTypeGuessSession(session())?.name).toBe('Intento 1')
    expect(getTypeGuessSessions()).toHaveLength(1)
    expect(getTypeGuessSession('type-guess-session')?.rounds).toHaveLength(10)
    expect(renameTypeGuessSession('type-guess-session', 'Tipos de Sinnoh')?.name).toBe('Tipos de Sinnoh')
    expect(getStored(GAME_SESSIONS_STORAGE_KEY)).toMatchObject({ version: 1 })
  })
})
