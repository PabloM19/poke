import { createGameSessionId, getGameSession, getGameSessions, nextGameAttemptName, renameGameSession, saveGameSession, useGameSessions } from '@/features/gameSessions'
import type { EffectivenessSession } from './model'

export function getEffectivenessSessions(): readonly EffectivenessSession[] { return getGameSessions('type-effectiveness') }
export function getEffectivenessSession(id: string): EffectivenessSession | null { return getGameSession(id, 'type-effectiveness') }
export function nextEffectivenessAttemptName(): string { return nextGameAttemptName('type-effectiveness') }
export function saveEffectivenessSession(session: EffectivenessSession, name = ''): EffectivenessSession | null { return saveGameSession(session, name) }
export function renameEffectivenessSession(id: string, name: string): EffectivenessSession | null { return renameGameSession(id, 'type-effectiveness', name) }
export function createEffectivenessSessionId(now = Date.now()): string { return createGameSessionId('type-effectiveness', now) }
export function useEffectivenessSessions() { return useGameSessions('type-effectiveness') }
