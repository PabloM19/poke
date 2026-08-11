import { describe, expect, it } from 'vitest'
import { GAME_SESSIONS_STORAGE_KEY } from '@/features/gameSessions'
import { getStored } from '@/lib/storage'
import type { PokemonIntruderRound, PokemonIntruderSession } from './model'
import { getPokemonIntruderSession, getPokemonIntruderSessions, renamePokemonIntruderSession, savePokemonIntruderSession } from './sessionStore'

const pokemon = [
  { id: 1, name: 'Bulbasaur', sprite: '1.png', types: ['grass', 'poison'] },
  { id: 43, name: 'Oddish', sprite: '43.png', types: ['grass', 'poison'] },
  { id: 69, name: 'Bellsprout', sprite: '69.png', types: ['grass', 'poison'] },
  { id: 4, name: 'Charmander', sprite: '4.png', types: ['fire'] },
]

function round(index: number): PokemonIntruderRound {
  return { index, criterion: { kind: 'shared-type', type: 'grass' }, pokemon, intruderId: 4, selectedId: index === 1 ? 1 : 4, correct: index !== 1 }
}

function session(): PokemonIntruderSession {
  return {
    id: 'intruder-session', gameType: 'pokemon-intruder', name: '', activeGameId: 'platino', gameTitle: 'Pokémon Platino',
    pokedexLabel: 'Pokédex regional de Sinnoh', generation: 4, startedAt: 1_000, finishedAt: 2_000,
    score: 9, bestStreak: 9, totalRounds: 10, rounds: Array.from({ length: 10 }, (_, index) => round(index + 1)),
  }
}

describe('sesiones de Pokémon intruso', () => {
  it('persiste criterio, grupo, selección y permite renombrar', () => {
    expect(savePokemonIntruderSession(session())?.name).toBe('Intento 1')
    expect(getPokemonIntruderSessions()).toHaveLength(1)
    expect(getPokemonIntruderSession('intruder-session')?.rounds[0]).toMatchObject({ intruderId: 4, selectedId: 1, correct: false })
    expect(renamePokemonIntruderSession('intruder-session', 'Intrusos de Sinnoh')?.name).toBe('Intrusos de Sinnoh')
    expect(getStored(GAME_SESSIONS_STORAGE_KEY)).toMatchObject({ version: 1 })
  })
})
