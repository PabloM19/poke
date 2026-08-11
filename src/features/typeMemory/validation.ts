import { isGameSelection } from '@/features/games'
import { isPokemonType } from '@/features/types'
import { TYPE_MEMORY_DIFFICULTIES, type TypeMemoryDifficulty, type TypeMemorySession, type TypeMemoryTurn } from './model'

function isRecord(value: unknown): value is Record<string, unknown> { return value != null && typeof value === 'object' && !Array.isArray(value) }
function nonNegativeInteger(value: unknown): boolean { return Number.isInteger(value) && Number(value) >= 0 }
function isDifficulty(value: unknown): value is TypeMemoryDifficulty { return value === 'easy' || value === 'normal' || value === 'hard' }

function isTurn(value: unknown): value is TypeMemoryTurn {
  return isRecord(value) && Number.isInteger(value.index) && Number(value.index) > 0 &&
    typeof value.firstCardId === 'string' && value.firstCardId.length > 0 &&
    typeof value.secondCardId === 'string' && value.secondCardId.length > 0 &&
    typeof value.firstType === 'string' && isPokemonType(value.firstType) &&
    typeof value.secondType === 'string' && isPokemonType(value.secondType) &&
    typeof value.matched === 'boolean'
}

export function isTypeMemorySession(value: unknown): value is TypeMemorySession {
  if (!isRecord(value) || !isDifficulty(value.difficulty)) return false
  const expectedPairs = TYPE_MEMORY_DIFFICULTIES[value.difficulty].pairCount
  return typeof value.id === 'string' && value.id.length > 0 && value.id.length <= 120 && value.gameType === 'type-memory' &&
    typeof value.name === 'string' && value.name.length > 0 && value.name.length <= 80 && isGameSelection(value.activeGameId) &&
    typeof value.gameTitle === 'string' && value.gameTitle.length > 0 && typeof value.pokedexLabel === 'string' && value.pokedexLabel.length > 0 &&
    (value.generation === 4 || value.generation === 5) && typeof value.startedAt === 'number' && Number.isFinite(value.startedAt) &&
    typeof value.finishedAt === 'number' && Number.isFinite(value.finishedAt) && value.finishedAt >= value.startedAt &&
    value.pairCount === expectedPairs && value.score === expectedPairs && value.totalRounds === expectedPairs &&
    nonNegativeInteger(value.bestStreak) && Number(value.bestStreak) <= expectedPairs && nonNegativeInteger(value.attempts) &&
    typeof value.durationMs === 'number' && Number.isFinite(value.durationMs) && value.durationMs >= 0 &&
    Array.isArray(value.typesUsed) && value.typesUsed.length === expectedPairs && new Set(value.typesUsed).size === expectedPairs && value.typesUsed.every((type) => typeof type === 'string' && isPokemonType(type)) &&
    Array.isArray(value.rounds) && value.rounds.length === value.attempts && value.rounds.every(isTurn)
}
