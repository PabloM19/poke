import { isGameSelection } from '@/features/games'
import { EVOLUTION_CHAIN_TOTAL_ROUNDS, type EvolutionChainRound, type EvolutionChainSession, type EvolutionStageSnapshot } from './model'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function isPositiveInteger(value: unknown): boolean {
  return Number.isInteger(value) && Number(value) > 0
}

function isIdOrder(value: unknown, size: number): value is number[] {
  return Array.isArray(value) && value.length === size && value.every(isPositiveInteger) && new Set(value).size === size
}

function isPokemon(value: unknown): value is EvolutionStageSnapshot {
  if (!isRecord(value)) return false
  return isPositiveInteger(value.id) && typeof value.name === 'string' && value.name.length > 0 && value.name.length <= 80 &&
    (value.sprite == null || typeof value.sprite === 'string') && (value.method == null || typeof value.method === 'string')
}

function isRound(value: unknown): value is EvolutionChainRound {
  if (!isRecord(value) || !Array.isArray(value.pokemon) || value.pokemon.length < 2 || value.pokemon.length > 3 || !value.pokemon.every(isPokemon)) return false
  const size = value.pokemon.length
  const pokemonIds = new Set(value.pokemon.map((pokemon) => pokemon.id))
  const orders = [value.presentedOrder, value.selectedOrder, value.correctOrder]
  return isPositiveInteger(value.index) && Number(value.index) <= EVOLUTION_CHAIN_TOTAL_ROUNDS && isPositiveInteger(value.chainId) &&
    orders.every((order) => isIdOrder(order, size) && order.every((id) => pokemonIds.has(id))) && typeof value.correct === 'boolean'
}

export function isEvolutionChainSession(value: unknown): value is EvolutionChainSession {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && value.id.length > 0 && value.id.length <= 120 && value.gameType === 'evolution-chain' &&
    typeof value.name === 'string' && value.name.length > 0 && value.name.length <= 80 && isGameSelection(value.activeGameId) &&
    typeof value.gameTitle === 'string' && value.gameTitle.length > 0 && typeof value.pokedexLabel === 'string' && value.pokedexLabel.length > 0 &&
    (value.generation === 4 || value.generation === 5) && typeof value.startedAt === 'number' && Number.isFinite(value.startedAt) &&
    typeof value.finishedAt === 'number' && Number.isFinite(value.finishedAt) && value.finishedAt >= value.startedAt &&
    Number.isInteger(value.score) && Number(value.score) >= 0 && Number(value.score) <= EVOLUTION_CHAIN_TOTAL_ROUNDS &&
    Number.isInteger(value.bestStreak) && Number(value.bestStreak) >= 0 && Number(value.bestStreak) <= EVOLUTION_CHAIN_TOTAL_ROUNDS &&
    value.totalRounds === EVOLUTION_CHAIN_TOTAL_ROUNDS && Array.isArray(value.rounds) && value.rounds.length === EVOLUTION_CHAIN_TOTAL_ROUNDS &&
    value.rounds.every(isRound)
}
