import { isGameSelection } from '@/features/games'
import { isPokemonType } from '@/features/types'
import { EFFECTIVENESS_TOTAL_ROUNDS, type EffectivenessAnswer, type EffectivenessRound, type EffectivenessSession } from './model'

function isRecord(value: unknown): value is Record<string, unknown> { return value != null && typeof value === 'object' }
function isAnswer(value: unknown): value is EffectivenessAnswer {
  return value === 'super-effective' || value === 'normal' || value === 'not-very-effective' || value === 'no-effect'
}
function isRound(value: unknown): value is EffectivenessRound {
  if (!isRecord(value)) return false
  return Number.isInteger(value.index) && Number(value.index) >= 1 && Number(value.index) <= EFFECTIVENESS_TOTAL_ROUNDS &&
    typeof value.attackingType === 'string' && isPokemonType(value.attackingType) && typeof value.defendingType === 'string' &&
    isPokemonType(value.defendingType) && [0, 0.5, 1, 2].includes(Number(value.multiplier)) && isAnswer(value.selectedAnswer) &&
    typeof value.correct === 'boolean'
}

export function isEffectivenessSession(value: unknown): value is EffectivenessSession {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && value.id.length > 0 && value.id.length <= 120 && value.gameType === 'type-effectiveness' &&
    typeof value.name === 'string' && value.name.length > 0 && value.name.length <= 80 && isGameSelection(value.activeGameId) &&
    typeof value.gameTitle === 'string' && value.gameTitle.length > 0 && typeof value.pokedexLabel === 'string' && value.pokedexLabel.length > 0 &&
    (value.generation === 4 || value.generation === 5) && typeof value.startedAt === 'number' && Number.isFinite(value.startedAt) &&
    typeof value.finishedAt === 'number' && Number.isFinite(value.finishedAt) && value.finishedAt >= value.startedAt &&
    Number.isInteger(value.score) && Number(value.score) >= 0 && Number(value.score) <= EFFECTIVENESS_TOTAL_ROUNDS &&
    Number.isInteger(value.bestStreak) && Number(value.bestStreak) >= 0 && Number(value.bestStreak) <= EFFECTIVENESS_TOTAL_ROUNDS &&
    value.totalRounds === EFFECTIVENESS_TOTAL_ROUNDS && Array.isArray(value.rounds) && value.rounds.length === EFFECTIVENESS_TOTAL_ROUNDS && value.rounds.every(isRound)
}
