import { createGameSessionId, getGameSession, getGameSessions, nextGameAttemptName, renameGameSession, saveGameSession, useGameSessions } from '@/features/gameSessions'
import type { TypeGuessSession } from './model'

export function getTypeGuessSessions(): readonly TypeGuessSession[] { return getGameSessions('type-guess') }
export function getTypeGuessSession(id: string): TypeGuessSession | null { return getGameSession(id, 'type-guess') }
export function nextTypeGuessAttemptName(): string { return nextGameAttemptName('type-guess') }
export function saveTypeGuessSession(session: TypeGuessSession, name = ''): TypeGuessSession | null { return saveGameSession(session, name) }
export function renameTypeGuessSession(id: string, name: string): TypeGuessSession | null { return renameGameSession(id, 'type-guess', name) }
export function createTypeGuessSessionId(now = Date.now()): string { return createGameSessionId('type-guess', now) }
export function useTypeGuessSessions() { return useGameSessions('type-guess') }

