import { createGameSessionId, getGameSession, getGameSessions, nextGameAttemptName, renameGameSession, saveGameSession, useGameSessions } from '@/features/gameSessions'
import type { EvolutionChainSession } from './model'

export function getEvolutionChainSessions(): readonly EvolutionChainSession[] { return getGameSessions('evolution-chain') }
export function getEvolutionChainSession(id: string): EvolutionChainSession | null { return getGameSession(id, 'evolution-chain') }
export function nextEvolutionChainAttemptName(): string { return nextGameAttemptName('evolution-chain') }
export function saveEvolutionChainSession(session: EvolutionChainSession, name = ''): EvolutionChainSession | null { return saveGameSession(session, name) }
export function renameEvolutionChainSession(id: string, name: string): EvolutionChainSession | null { return renameGameSession(id, 'evolution-chain', name) }
export function createEvolutionChainSessionId(now = Date.now()): string { return createGameSessionId('evolution-chain', now) }
export function useEvolutionChainSessions() { return useGameSessions('evolution-chain') }
