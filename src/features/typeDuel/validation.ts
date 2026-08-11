import { isGameSelection } from '@/features/games'
import { isPokemonType } from '@/features/types'
import {
  TYPE_DUEL_TOTAL_ROUNDS,
  type TypeDuelAnswer,
  type TypeDuelAttackResult,
  type TypeDuelPokemonSnapshot,
  type TypeDuelRound,
  type TypeDuelSession,
} from './model'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object'
}

function isAnswer(value: unknown): value is TypeDuelAnswer {
  return value === 'left' || value === 'neutral' || value === 'right'
}

function isPokemon(value: unknown): value is TypeDuelPokemonSnapshot {
  if (!isRecord(value)) return false
  return Number.isInteger(value.id) && Number(value.id) > 0 &&
    typeof value.name === 'string' && value.name.length > 0 && value.name.length <= 80 &&
    (value.sprite == null || typeof value.sprite === 'string') &&
    Array.isArray(value.types) && value.types.length >= 1 && value.types.length <= 2 &&
    value.types.every((type) => typeof type === 'string' && isPokemonType(type))
}

function isAttack(value: unknown): value is TypeDuelAttackResult {
  if (!isRecord(value)) return false
  return typeof value.attackingType === 'string' && isPokemonType(value.attackingType) &&
    [0, 0.25, 0.5, 1, 2, 4].includes(Number(value.multiplier))
}

function isRound(value: unknown): value is TypeDuelRound {
  if (!isRecord(value)) return false
  return Number.isInteger(value.index) && Number(value.index) >= 1 && Number(value.index) <= TYPE_DUEL_TOTAL_ROUNDS &&
    isPokemon(value.left) && isPokemon(value.right) && isAttack(value.leftBest) && isAttack(value.rightBest) &&
    isAnswer(value.correctAnswer) && isAnswer(value.userAnswer) && typeof value.isCorrect === 'boolean'
}

export function isTypeDuelSession(value: unknown): value is TypeDuelSession {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && value.id.length > 0 && value.id.length <= 120 &&
    value.gameType === 'type-duel' && typeof value.name === 'string' && value.name.length > 0 && value.name.length <= 80 &&
    isGameSelection(value.activeGameId) && typeof value.gameTitle === 'string' && value.gameTitle.length > 0 &&
    typeof value.pokedexLabel === 'string' && value.pokedexLabel.length > 0 &&
    (value.generation === 4 || value.generation === 5) && (value.mode === 'learn' || value.mode === 'normal') &&
    typeof value.startedAt === 'number' && Number.isFinite(value.startedAt) &&
    typeof value.finishedAt === 'number' && Number.isFinite(value.finishedAt) && value.finishedAt >= value.startedAt &&
    Number.isInteger(value.score) && Number(value.score) >= 0 && Number(value.score) <= TYPE_DUEL_TOTAL_ROUNDS &&
    Number.isInteger(value.bestStreak) && Number(value.bestStreak) >= 0 && Number(value.bestStreak) <= TYPE_DUEL_TOTAL_ROUNDS &&
    value.totalRounds === TYPE_DUEL_TOTAL_ROUNDS && Array.isArray(value.rounds) &&
    value.rounds.length === TYPE_DUEL_TOTAL_ROUNDS && value.rounds.every(isRound)
}

