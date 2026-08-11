import { isGameSelection } from '@/features/games'
import { isPokemonType } from '@/features/types'
import { POKEMON_INTRUDER_TOTAL_ROUNDS, type IntruderPokemonSnapshot, type PokemonIntruderRound, type PokemonIntruderSession } from './model'

function isRecord(value: unknown): value is Record<string, unknown> { return value != null && typeof value === 'object' && !Array.isArray(value) }
function positiveInteger(value: unknown): boolean { return Number.isInteger(value) && Number(value) > 0 }

function isPokemon(value: unknown): value is IntruderPokemonSnapshot {
  if (!isRecord(value)) return false
  return positiveInteger(value.id) && typeof value.name === 'string' && value.name.length > 0 && value.name.length <= 80 &&
    (value.sprite == null || typeof value.sprite === 'string') && Array.isArray(value.types) && value.types.length >= 1 && value.types.length <= 2 &&
    value.types.every((type) => typeof type === 'string' && isPokemonType(type))
}

function isRound(value: unknown): value is PokemonIntruderRound {
  if (!isRecord(value) || !isRecord(value.criterion) || value.criterion.kind !== 'shared-type' || typeof value.criterion.type !== 'string' || !isPokemonType(value.criterion.type)) return false
  if (!Array.isArray(value.pokemon) || value.pokemon.length !== 4 || !value.pokemon.every(isPokemon)) return false
  const ids = new Set(value.pokemon.map((pokemon) => pokemon.id))
  return ids.size === 4 && positiveInteger(value.index) && Number(value.index) <= POKEMON_INTRUDER_TOTAL_ROUNDS &&
    positiveInteger(value.intruderId) && ids.has(Number(value.intruderId)) && positiveInteger(value.selectedId) && ids.has(Number(value.selectedId)) &&
    typeof value.correct === 'boolean'
}

export function isPokemonIntruderSession(value: unknown): value is PokemonIntruderSession {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && value.id.length > 0 && value.id.length <= 120 && value.gameType === 'pokemon-intruder' &&
    typeof value.name === 'string' && value.name.length > 0 && value.name.length <= 80 && isGameSelection(value.activeGameId) &&
    typeof value.gameTitle === 'string' && value.gameTitle.length > 0 && typeof value.pokedexLabel === 'string' && value.pokedexLabel.length > 0 &&
    (value.generation === 4 || value.generation === 5) && typeof value.startedAt === 'number' && Number.isFinite(value.startedAt) &&
    typeof value.finishedAt === 'number' && Number.isFinite(value.finishedAt) && value.finishedAt >= value.startedAt &&
    Number.isInteger(value.score) && Number(value.score) >= 0 && Number(value.score) <= POKEMON_INTRUDER_TOTAL_ROUNDS &&
    Number.isInteger(value.bestStreak) && Number(value.bestStreak) >= 0 && Number(value.bestStreak) <= POKEMON_INTRUDER_TOTAL_ROUNDS &&
    value.totalRounds === POKEMON_INTRUDER_TOTAL_ROUNDS && Array.isArray(value.rounds) && value.rounds.length === POKEMON_INTRUDER_TOTAL_ROUNDS &&
    value.rounds.every(isRound)
}
