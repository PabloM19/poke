import { isGameSelection } from '@/features/games'
import { isPokemonType } from '@/features/types'
import { TYPE_GUESS_TOTAL_ROUNDS, type TypeGuessPokemonRecord, type TypeGuessRound, type TypeGuessSession } from './model'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object'
}

function isPokemon(value: unknown): value is TypeGuessPokemonRecord {
  if (!isRecord(value)) return false
  return Number.isInteger(value.id) && Number(value.id) > 0 && typeof value.name === 'string' && value.name.length > 0 &&
    (value.sprite == null || typeof value.sprite === 'string') && Array.isArray(value.actualTypes) &&
    value.actualTypes.length >= 1 && value.actualTypes.length <= 2 && value.actualTypes.every((type) => typeof type === 'string' && isPokemonType(type)) &&
    Number.isInteger(value.regionalNumber) && Number(value.regionalNumber) > 0
}

function isRound(value: unknown): value is TypeGuessRound {
  if (!isRecord(value)) return false
  return Number.isInteger(value.index) && Number(value.index) >= 1 && Number(value.index) <= TYPE_GUESS_TOTAL_ROUNDS &&
    isPokemon(value.pokemon) && Array.isArray(value.selectedTypes) && value.selectedTypes.length >= 1 && value.selectedTypes.length <= 2 &&
    value.selectedTypes.every((type) => typeof type === 'string' && isPokemonType(type)) &&
    (value.result === 'correct' || value.result === 'partial' || value.result === 'incorrect') &&
    typeof value.hintUsed === 'boolean' && typeof value.answeredAt === 'number' && Number.isFinite(value.answeredAt)
}

export function isTypeGuessSession(value: unknown): value is TypeGuessSession {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && value.id.length > 0 && value.id.length <= 120 && value.gameType === 'type-guess' &&
    typeof value.name === 'string' && value.name.length > 0 && value.name.length <= 80 && isGameSelection(value.activeGameId) &&
    typeof value.gameTitle === 'string' && value.gameTitle.length > 0 && typeof value.pokedexLabel === 'string' && value.pokedexLabel.length > 0 &&
    (value.generation === 4 || value.generation === 5) && typeof value.startedAt === 'number' && Number.isFinite(value.startedAt) &&
    typeof value.finishedAt === 'number' && Number.isFinite(value.finishedAt) && value.finishedAt >= value.startedAt &&
    Number.isInteger(value.score) && Number(value.score) >= 0 && Number(value.score) <= TYPE_GUESS_TOTAL_ROUNDS &&
    Number.isInteger(value.bestStreak) && Number(value.bestStreak) >= 0 && Number(value.bestStreak) <= TYPE_GUESS_TOTAL_ROUNDS &&
    value.totalRounds === TYPE_GUESS_TOTAL_ROUNDS && Number.isInteger(value.partialAnswers) && Number(value.partialAnswers) >= 0 &&
    Number(value.partialAnswers) <= TYPE_GUESS_TOTAL_ROUNDS && Number.isInteger(value.withoutDetails) && Number(value.withoutDetails) >= 0 &&
    Number(value.withoutDetails) <= TYPE_GUESS_TOTAL_ROUNDS && Array.isArray(value.rounds) && value.rounds.length === TYPE_GUESS_TOTAL_ROUNDS &&
    value.rounds.every(isRound)
}
