import { createGameSessionId, getGameSession, getGameSessions, nextGameAttemptName, renameGameSession, saveGameSession, useGameSessions } from '@/features/gameSessions'
import type { TypeMemorySession } from './model'

export function getTypeMemorySessions(): readonly TypeMemorySession[] { return getGameSessions('type-memory') }
export function getTypeMemorySession(id: string): TypeMemorySession | null { return getGameSession(id, 'type-memory') }
export function nextTypeMemoryAttemptName(): string { return nextGameAttemptName('type-memory') }
export function saveTypeMemorySession(session: TypeMemorySession, name = ''): TypeMemorySession | null { return saveGameSession(session, name) }
export function renameTypeMemorySession(id: string, name: string): TypeMemorySession | null { return renameGameSession(id, 'type-memory', name) }
export function createTypeMemorySessionId(now = Date.now()): string { return createGameSessionId('type-memory', now) }
export function useTypeMemorySessions() { return useGameSessions('type-memory') }
