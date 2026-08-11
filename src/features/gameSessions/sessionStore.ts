import { getStored, removeStored, setStored } from '@/lib/storage'
import { isTypeDuelSession } from '@/features/typeDuel/validation'
import { isPokemonSilhouetteSession } from '@/features/pokemonSilhouette/validation'
import { isTypeGuessSession } from '@/features/typeGuess/validation'
import { isEffectivenessSession } from '@/features/effectivenessQuiz/validation'
import { isEvolutionChainSession } from '@/features/evolutionChain/validation'
import { isPokemonIntruderSession } from '@/features/pokemonIntruder/validation'
import { isTypeMemorySession } from '@/features/typeMemory/validation'
import type { TypeDuelSession } from '@/features/typeDuel/model'
import type { PokemonSilhouetteSession } from '@/features/pokemonSilhouette/model'
import type { TypeGuessSession } from '@/features/typeGuess/model'
import type { EffectivenessSession } from '@/features/effectivenessQuiz/model'
import type { EvolutionChainSession } from '@/features/evolutionChain/model'
import type { PokemonIntruderSession } from '@/features/pokemonIntruder/model'
import type { TypeMemorySession } from '@/features/typeMemory/model'
import type { GameType } from './model'

export type StoredGameSession = TypeDuelSession | PokemonSilhouetteSession | TypeGuessSession | EffectivenessSession | EvolutionChainSession | PokemonIntruderSession | TypeMemorySession

export const GAME_SESSIONS_STORE_VERSION = 1
export const GAME_SESSIONS_STORAGE_KEY = 'games:sessions:v1'
export const GAME_SESSIONS_EVENT = 'pokeapp:game-sessions'
export const LEGACY_TYPE_DUEL_STORAGE_KEY = 'games:type-duel:sessions:v1'
const MAX_SESSIONS = 100

interface SessionStorePayload {
  version: typeof GAME_SESSIONS_STORE_VERSION
  sessions: readonly StoredGameSession[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object'
}

function isStoredSession(value: unknown): value is StoredGameSession {
  return isTypeDuelSession(value) || isPokemonSilhouetteSession(value) || isTypeGuessSession(value) || isEffectivenessSession(value) || isEvolutionChainSession(value) || isPokemonIntruderSession(value) || isTypeMemorySession(value)
}

function readPayload(key: string): readonly StoredGameSession[] | null {
  const raw = getStored<unknown>(key)
  if (raw == null) return null
  if (!isRecord(raw) || raw.version !== GAME_SESSIONS_STORE_VERSION || !Array.isArray(raw.sessions)) {
    removeStored(key)
    return []
  }
  return raw.sessions.filter(isStoredSession)
}

function writeSessions(sessions: readonly StoredGameSession[]): boolean {
  return setStored<SessionStorePayload>(GAME_SESSIONS_STORAGE_KEY, {
    version: GAME_SESSIONS_STORE_VERSION,
    sessions: sessions.slice(0, MAX_SESSIONS),
  })
}

function migrateLegacyTypeDuelSessions(): readonly StoredGameSession[] {
  const legacy = readPayload(LEGACY_TYPE_DUEL_STORAGE_KEY) ?? []
  if (legacy.length > 0) writeSessions(legacy)
  removeStored(LEGACY_TYPE_DUEL_STORAGE_KEY)
  return legacy
}

function notify(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(GAME_SESSIONS_EVENT))
}

export function getGameSessions<T extends GameType>(gameType: T): readonly Extract<StoredGameSession, { gameType: T }>[]
export function getGameSessions(): readonly StoredGameSession[]
export function getGameSessions(gameType?: GameType): readonly StoredGameSession[] {
  const sessions = readPayload(GAME_SESSIONS_STORAGE_KEY) ?? migrateLegacyTypeDuelSessions()
  const sorted = [...sessions].sort((left, right) => right.finishedAt - left.finishedAt).slice(0, MAX_SESSIONS)
  return gameType == null ? sorted : sorted.filter((session) => session.gameType === gameType)
}

export function getGameSession<T extends GameType>(id: string, gameType: T): Extract<StoredGameSession, { gameType: T }> | null {
  return getGameSessions(gameType).find((session) => session.id === id) ?? null
}

export function nextGameAttemptName(gameType: GameType): string {
  const sessions = getGameSessions(gameType)
  const highest = sessions.reduce((result, session) => {
    const match = /^Intento (\d+)$/.exec(session.name)
    return match ? Math.max(result, Number(match[1])) : result
  }, 0)
  return `Intento ${Math.max(highest, sessions.length) + 1}`
}

function normalizeName(value: string, fallback: string): string {
  const trimmed = value.trim().replace(/\s+/g, ' ')
  return (trimmed || fallback).slice(0, 80)
}

export function saveGameSession<T extends StoredGameSession>(session: T, requestedName = ''): T | null {
  const saved = {
    ...session,
    name: normalizeName(requestedName, nextGameAttemptName(session.gameType)),
  } as T
  if (!isStoredSession(saved)) return null
  const sessions = [saved, ...getGameSessions().filter((entry) => entry.id !== saved.id)]
    .sort((left, right) => right.finishedAt - left.finishedAt)
    .slice(0, MAX_SESSIONS)
  if (!writeSessions(sessions)) return null
  notify()
  return saved
}

export function renameGameSession<T extends GameType>(id: string, gameType: T, requestedName: string): Extract<StoredGameSession, { gameType: T }> | null {
  const current = getGameSessions()
  const session = current.find((entry) => entry.id === id && entry.gameType === gameType)
  if (!session || requestedName.trim().length === 0) return null
  const renamed = { ...session, name: normalizeName(requestedName, session.name) }
  if (!writeSessions(current.map((entry) => entry.id === id ? renamed : entry))) return null
  notify()
  return renamed as Extract<StoredGameSession, { gameType: T }>
}

export function createGameSessionId(gameType: GameType, now = Date.now()): string {
  const random = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10)
  return `${gameType}-${now}-${random}`
}
