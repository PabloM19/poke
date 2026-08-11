import {
  createGameSessionId,
  getGameSession,
  getGameSessions,
  nextGameAttemptName,
  renameGameSession,
  saveGameSession,
  useGameSessions,
} from '@/features/gameSessions'
import type { PokemonSilhouetteSession } from './model'

export function getPokemonSilhouetteSessions(): readonly PokemonSilhouetteSession[] {
  return getGameSessions('pokemon-silhouette')
}

export function getPokemonSilhouetteSession(id: string): PokemonSilhouetteSession | null {
  return getGameSession(id, 'pokemon-silhouette')
}

export function nextPokemonSilhouetteAttemptName(): string {
  return nextGameAttemptName('pokemon-silhouette')
}

export function savePokemonSilhouetteSession(session: PokemonSilhouetteSession, requestedName = ''): PokemonSilhouetteSession | null {
  return saveGameSession(session, requestedName)
}

export function renamePokemonSilhouetteSession(id: string, name: string): PokemonSilhouetteSession | null {
  return renameGameSession(id, 'pokemon-silhouette', name)
}

export function createPokemonSilhouetteSessionId(now = Date.now()): string {
  return createGameSessionId('pokemon-silhouette', now)
}

export function usePokemonSilhouetteSessions() {
  return useGameSessions('pokemon-silhouette')
}

