import { describe, expect, it } from 'vitest'
import { getStored } from '@/lib/storage'
import { GAME_SESSIONS_STORAGE_KEY } from '@/features/gameSessions'
import type { PokemonSilhouetteRound, PokemonSilhouetteSession } from './model'
import { getPokemonSilhouetteSession, getPokemonSilhouetteSessions, renamePokemonSilhouetteSession, savePokemonSilhouetteSession } from './sessionStore'

function round(index: number): PokemonSilhouetteRound {
  return {
    index,
    pokemon: { id: 25, name: 'Pikachu', sprite: null, types: ['electric'], regionalNumber: 104, generationId: 1 },
    selectedLetters: ['P', 'I', 'K', 'A', 'C', 'H', 'U'],
    incorrectLetters: index === 1 ? ['X'] : [],
    fullGuesses: [],
    errors: index === 1 ? 1 : 0,
    hints: index === 1 ? [{ kind: 'letter', label: 'Letra revelada', value: 'P', letter: 'P' }] : [],
    result: 'solved',
    points: index === 1 ? 2 : 3,
  }
}

function session(): PokemonSilhouetteSession {
  return {
    id: 'silhouette-session', gameType: 'pokemon-silhouette', name: '', activeGameId: 'platino',
    gameTitle: 'Pokémon Platino', pokedexLabel: 'Pokédex regional de Sinnoh', generation: 4,
    startedAt: 1_000, finishedAt: 2_000, score: 10, bestStreak: 10, totalRounds: 10,
    points: 29, perfectRounds: 9, rounds: Array.from({ length: 10 }, (_, index) => round(index + 1)),
  }
}

describe('sesiones compartidas de siluetas', () => {
  it('guarda, recupera y renombra una sesión completa', () => {
    expect(savePokemonSilhouetteSession(session())?.name).toBe('Intento 1')
    expect(getPokemonSilhouetteSessions()).toHaveLength(1)
    expect(getPokemonSilhouetteSession('silhouette-session')?.rounds).toHaveLength(10)
    expect(renamePokemonSilhouetteSession('silhouette-session', 'Siluetas de Sinnoh')?.name).toBe('Siluetas de Sinnoh')
    expect(getStored(GAME_SESSIONS_STORAGE_KEY)).toMatchObject({ version: 1 })
  })
})

