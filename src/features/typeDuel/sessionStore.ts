import {
  createGameSessionId,
  GAME_SESSIONS_STORAGE_KEY,
  getGameSession,
  getGameSessions,
  nextGameAttemptName,
  renameGameSession,
  saveGameSession,
} from '@/features/gameSessions'
import type { TypeDuelSession } from './model'

export const TYPE_DUEL_STORAGE_KEY = GAME_SESSIONS_STORAGE_KEY

export function getTypeDuelSessions(): readonly TypeDuelSession[] {
  return getGameSessions('type-duel')
}

export function getTypeDuelSession(id: string): TypeDuelSession | null {
  return getGameSession(id, 'type-duel')
}

export function nextTypeDuelAttemptName(): string {
  return nextGameAttemptName('type-duel')
}

export function saveTypeDuelSession(session: TypeDuelSession, requestedName = ''): TypeDuelSession | null {
  return saveGameSession(session, requestedName)
}

export function renameTypeDuelSession(id: string, requestedName: string): TypeDuelSession | null {
  return renameGameSession(id, 'type-duel', requestedName)
}

export function createTypeDuelSessionId(now = Date.now()): string {
  return createGameSessionId('type-duel', now)
}

