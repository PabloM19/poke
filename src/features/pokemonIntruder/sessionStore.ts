import { createGameSessionId, getGameSession, getGameSessions, nextGameAttemptName, renameGameSession, saveGameSession, useGameSessions } from '@/features/gameSessions'
import type { PokemonIntruderSession } from './model'

export function getPokemonIntruderSessions(): readonly PokemonIntruderSession[] { return getGameSessions('pokemon-intruder') }
export function getPokemonIntruderSession(id: string): PokemonIntruderSession | null { return getGameSession(id, 'pokemon-intruder') }
export function nextPokemonIntruderAttemptName(): string { return nextGameAttemptName('pokemon-intruder') }
export function savePokemonIntruderSession(session: PokemonIntruderSession, name = ''): PokemonIntruderSession | null { return saveGameSession(session, name) }
export function renamePokemonIntruderSession(id: string, name: string): PokemonIntruderSession | null { return renameGameSession(id, 'pokemon-intruder', name) }
export function createPokemonIntruderSessionId(now = Date.now()): string { return createGameSessionId('pokemon-intruder', now) }
export function usePokemonIntruderSessions() { return useGameSessions('pokemon-intruder') }
