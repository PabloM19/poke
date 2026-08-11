import { isGameSelection } from '@/features/games'
import { isPokemonType } from '@/features/types'
import {
  POKEMON_SILHOUETTE_MAX_ERRORS,
  POKEMON_SILHOUETTE_TOTAL_ROUNDS,
  type PokemonSilhouetteHint,
  type PokemonSilhouetteRound,
  type PokemonSilhouetteSession,
  type PokemonSilhouetteSnapshot,
} from './model'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object'
}

function isPokemon(value: unknown): value is PokemonSilhouetteSnapshot {
  if (!isRecord(value)) return false
  return Number.isInteger(value.id) && Number(value.id) > 0 &&
    typeof value.name === 'string' && value.name.length > 0 && value.name.length <= 80 &&
    (value.sprite == null || typeof value.sprite === 'string') &&
    Array.isArray(value.types) && value.types.length >= 1 && value.types.length <= 2 &&
    value.types.every((type) => typeof type === 'string' && isPokemonType(type)) &&
    Number.isInteger(value.regionalNumber) && Number(value.regionalNumber) > 0 &&
    Number.isInteger(value.generationId) && Number(value.generationId) >= 1 && Number(value.generationId) <= 5
}

function isHint(value: unknown): value is PokemonSilhouetteHint {
  if (!isRecord(value) || typeof value.kind !== 'string' || typeof value.label !== 'string' || typeof value.value !== 'string') return false
  if (value.kind === 'letter') return typeof value.letter === 'string' && value.letter.length === 1
  if (value.kind === 'type') return typeof value.type === 'string' && isPokemonType(value.type)
  return value.kind === 'number-range' || value.kind === 'generation'
}

function isRound(value: unknown): value is PokemonSilhouetteRound {
  if (!isRecord(value)) return false
  return Number.isInteger(value.index) && Number(value.index) >= 1 && Number(value.index) <= POKEMON_SILHOUETTE_TOTAL_ROUNDS &&
    isPokemon(value.pokemon) && Array.isArray(value.selectedLetters) && value.selectedLetters.every((letter) => typeof letter === 'string') &&
    Array.isArray(value.incorrectLetters) && value.incorrectLetters.every((letter) => typeof letter === 'string') &&
    Array.isArray(value.fullGuesses) && value.fullGuesses.every((guess) => typeof guess === 'string') &&
    Number.isInteger(value.errors) && Number(value.errors) >= 0 && Number(value.errors) <= POKEMON_SILHOUETTE_MAX_ERRORS &&
    Array.isArray(value.hints) && value.hints.every(isHint) && (value.result === 'solved' || value.result === 'failed') &&
    Number.isInteger(value.points) && Number(value.points) >= 0 && Number(value.points) <= 3
}

export function isPokemonSilhouetteSession(value: unknown): value is PokemonSilhouetteSession {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && value.id.length > 0 && value.id.length <= 120 &&
    value.gameType === 'pokemon-silhouette' && typeof value.name === 'string' && value.name.length > 0 && value.name.length <= 80 &&
    isGameSelection(value.activeGameId) && typeof value.gameTitle === 'string' && value.gameTitle.length > 0 &&
    typeof value.pokedexLabel === 'string' && value.pokedexLabel.length > 0 && (value.generation === 4 || value.generation === 5) &&
    typeof value.startedAt === 'number' && Number.isFinite(value.startedAt) && typeof value.finishedAt === 'number' &&
    Number.isFinite(value.finishedAt) && value.finishedAt >= value.startedAt &&
    Number.isInteger(value.score) && Number(value.score) >= 0 && Number(value.score) <= POKEMON_SILHOUETTE_TOTAL_ROUNDS &&
    Number.isInteger(value.bestStreak) && Number(value.bestStreak) >= 0 && Number(value.bestStreak) <= POKEMON_SILHOUETTE_TOTAL_ROUNDS &&
    value.totalRounds === POKEMON_SILHOUETTE_TOTAL_ROUNDS && Number.isInteger(value.points) && Number(value.points) >= 0 && Number(value.points) <= 30 &&
    Number.isInteger(value.perfectRounds) && Number(value.perfectRounds) >= 0 && Number(value.perfectRounds) <= POKEMON_SILHOUETTE_TOTAL_ROUNDS &&
    Array.isArray(value.rounds) && value.rounds.length === POKEMON_SILHOUETTE_TOTAL_ROUNDS && value.rounds.every(isRound)
}

